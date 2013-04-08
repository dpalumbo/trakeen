function GUID()
{
    var S4 = function ()
    {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
		
}

function AddKeenEvent(page)
{
//project Id, api key
Keen.configure("50baa87c38433177ea000000", "8f963ce5138f4517b8d0a06af8eb36e4");

if ($.cookie("user_id") == null)
{
	$.cookie("user_id",GUID());
}
var user = $.cookie("user_id");

var time = new Date().getTime();

var ref_page = document.referrer;

var hit = {user_id:user,timestamp:time,last_page:ref_page};

Keen.addEvent(page, hit);
}
