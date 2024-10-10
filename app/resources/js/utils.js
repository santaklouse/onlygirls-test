const srcsDirName = 'resources';
const vendorDirName = 'node_modules';
const regex = /(?:(?<lang>js|css)\/?(?:(?<type>[A-Za-z\d]+)\/)?(?<name>\S+)\.(?<ext>\S+))$/;
const defaultOwnAssetName = 'main';

export const makeAssetName = (filePath, mode) => {
    if (filePath.split(/[\\/]/).length === 1) {
        return 'external';
    }
    if (filePath.includes(vendorDirName)) {
        if (mode === 'production') {
            return 'vendor';
        }
        return filePath.split(vendorDirName).pop()
            .split(/[\\/]/).filter(a => !!a).shift()
            .replaceAll(/[!@#$%^~()\/]/gi, '');
    }
    if (filePath.includes(srcsDirName)) {
        if (mode === 'production') {
            return defaultOwnAssetName;
        }
        filePath = filePath.substring(filePath.indexOf(srcsDirName)+srcsDirName.length);
        const {groups} = RegExp(regex, 'gi').exec(filePath);
        const { type = defaultOwnAssetName, name = defaultOwnAssetName} = groups;

        return [type, name].join('.').toLowerCase();
    }
    return defaultOwnAssetName;
}

export default {
    makeAssetName
};
