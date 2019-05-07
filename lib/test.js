var aa = `
<ul>
<li style="-moz-float-edge: content-box">Former Italian Prime Minister <a href="/wiki/Silvio_Berlusconi" title="Silvio Berlusconi">Silvio Berlusconi</a> <i>(pictured)</i> is <b><a href="/wiki/Silvio_Berlusconi_underage_prostitution_charges" title="Silvio Berlusconi underage prostitution charges">found guilty</a></b> of paying for sex with an underage prostitute.</li>
<li style="-moz-float-edge: content-box">In sports car racing, the <b><a href="/wiki/2013_24_Hours_of_Le_Mans" title="2013 24 Hours of Le Mans">24 Hours of Le Mans</a></b>, won by <a href="/wiki/Tom_Kristensen" title="Tom Kristensen">Tom Kristensen</a>, <a href="/wiki/Allan_McNish" title="Allan McNish">Allan McNish</a> and <a href="/wiki/Lo%C3%AFc_Duval" title="Loc Duval">Loc Duval</a>, is marred by the death of <b><a href="/wiki/Allan_Simonsen_(racing_driver)" title="Allan Simonsen (racing driver)">Allan Simonsen</a></b>.</li>
<li style="-moz-float-edge: content-box"><b><a href="/wiki/2013_Alberta_floods" title="2013 Alberta floods">Flood{-truncated-}`

//
var aa = aa.split('\n');

/* var rg = /(?<=href=").*?(?=")|(?<=>).*?(?=<)/g;


for(let i =0 ;i < aa.length;i++){
    let value = aa[i].match(rg)
    console.log(value)
}*/

var regex=/<a.*?href="(.*?)".*?>(.*?)<\/a>/ig;
var output=[];

for(let i =0;i<aa.length ;i++){
    aa[i].replace(regex,function(_,href,text){
        console.log('-----***----',href,'------',text)
        output.push(href.trim()+','+text.replace(/<.*?>/g,'').trim())
    });
    console.log(output.join('\n'));
}