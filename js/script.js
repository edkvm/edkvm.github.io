function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function addScale(input) {
	var res = '';
	var scale = { 1 : 'K', 2: 'M', 3: 'B' };
	var i = 1;
	var mul = 1000;

	do {
		
		res = (input / mul).toFixed(1).replace(".0", "") + scale[i];
		i = i + 1;
		mul = Math.pow(1000,i);
	
	} while ((input % mul) !== input)

	

	return res;
}
























