export const toRad = (num) => Math.PI * num / 180;
export const toDeg = (num) => 180 * num / Math.PI;
export const randomVal = (obj) => {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};
