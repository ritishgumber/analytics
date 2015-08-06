var url = window.location.origin+'/';

addCommas = function(nStr) {
    var rgx, x, x1, x2;
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = '';
    if (x.length > 1) {
        x2 = '.' + x[1];
    }
    rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};