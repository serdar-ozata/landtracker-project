const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Request = require("./premium/requestModel");
const Repository = require("./premium/assetRepositoryModel");
const AppError = require("../utils/appError");
// ALWAYS upgrade simple User to prem if you want to create a prem user

const INVITE_LIMIT = 4;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxLength: [30, "Please type a shorter name"],
        required: [true, 'Please tell us your name!'],
        validate: {
            validator: function (el) {
                return validator.isAlphanumeric(el, 'en-US', {ignore: " -"}); //"tr-TR"
            },
            message: "Invalid Name"
        }
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    // role: {
    //     type: String,
    //     enum: ['user', 'prem-user', 'admin'],
    //     default: 'user'
    // },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        maxLength: 30,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        index: true
    },
    passwordResetExpires: Date,
    canSee: {
        type: [mongoose.Schema.ObjectId],
        ref: 'AssetRepository'
    },
    activated: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    confirmToken: {
        type: String,
        index: true
    }
}, {discriminatorKey: "kind"});

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const passwordTime = this.passwordChangedAt.getTime() / 1000;
        return JWTTimeStamp < passwordTime;
    }
    return false;
}

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password') || (this.isNew && this.kind === "Prem")) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

//updates password change time
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 100 * 60 * 1000; // 100 minutes

    return resetToken;
};

userSchema.methods.createConfirmationToken = async function () {
    const token = crypto.randomBytes(32).toString('hex');

    this.confirmToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    return token;
}

userSchema.methods.sendRequest = async function (repoId, message) {
    const repository = await Repository.findById(repoId);
    if (!repository)
        return new AppError("Invalid repository id", 400);

    switch (repository.privacy) {
        case "Public":
            if (repository.canSee.includes(this._id) || repository.canEdit.includes(this._id))
                return new AppError("Already in", 400);

            repository.canSee.push(this._id);
            this.canSee.push(repository._id);
            await Promise.all([repository.save({validateBeforeSave: false}), this.save({validateBeforeSave: false})]);
            return "accepted"
        case "Invite":
            const invites = await Request.find({from:this._id}).exec();
            console.log(invites.length)
            if(invites.length > INVITE_LIMIT)
                return new AppError("Reached invite limit", 405);

            for (let invite in invites) {
                if(invite.to === repository._id)
                    return new AppError("Sent before", 400);
            }
            // if (await Request.findOne({from: this._id, to: repository._id}))
            //     return new AppError("Sent before", 400);

            if (repository.canSee.includes(this._id) || repository.canEdit.includes(this._id))
                return new AppError("Already in", 400);

            await Request.create({
                to: repoId,
                from: this._id,
                message
            });
            return "pending";
        default:
            return new AppError("Private Repository", 401);
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;