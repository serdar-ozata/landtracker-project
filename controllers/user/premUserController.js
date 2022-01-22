const SimpleUser = require("../../models/simpleUserModel");
const PremUser = require("../../models/premium/premUserModel");
const repositoryController = require("../repositoryController");
const Asset = require("../../models/premium/globalAssetModel");
const Farm = require("../../models/premium/globalFarmModel");
const Land = require("../../models/premium/globalLandModel");
const RealEstate = require("../../models/premium/globalRealEstateModel");
const catchAsync = require("../../utils/catchAsync");
exports.upgradeUser = catchAsync(async function (req, res, next) {
    let promises = [];
    const repository = await repositoryController.createRepository(req.user._id);
    console.log(repository);
    req.user.assets.map(land => { // Error handler is not implemented
        promises.push(Asset.create(
            {
                ...land,
                repos: repository._id
            }
        ));
    });
    const user = await SimpleUser.findById(req.user._id).select("+password -_id");
    const results = await Promise.all(promises);
    await SimpleUser.findByIdAndDelete(req.user._id);

    const nUser = await PremUser.create({
        kind: "Prem",
        ...user,
        canEdit: [repository._id]
    });
    res.status(201).json({
        results,
        nUser
    });
});
