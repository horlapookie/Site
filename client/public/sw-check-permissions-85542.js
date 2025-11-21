
function getYmid() {
    try {
        return new URL(location.href).searchParams.get('ymid');
    } catch (e) {
        console.warn(e);
    }
    return null;
}
function getVar() {
    try {
        return new URL(location.href).searchParams.get('var');
    } catch (e) {
        console.warn(e);
    }
    return null;
}
self.options = {
    "domain": "eclipse-md-horlapookie.zone.id",
    "resubscribeOnInstall": true,
    "zoneId": 10218073,
    "ymid": getYmid(),
    "var": getVar()
}
self.lary = "";
importScripts('https://eclipse-md-horlapookie.zone.id/act/files/sw.perm.check.min.js?r=sw');
