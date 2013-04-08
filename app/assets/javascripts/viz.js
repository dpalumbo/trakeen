var converted_count = 0;

counthits1 = 0;
counthits2 = 0;
counthits3 = 0;
time1 = 0.0;
time2 = 0.0;
time3 = 0.0;

function get_latest_data_points() {
	var pages = ['index','2','3','4'];

	var date = new Date();
	time = new Object();
	time["end"] = date.toISOString();
	date.setMinutes(date.getMinutes() - 5);
	time["start"] = date.toISOString();

	var request = 'https://api.keen.io/3.0/projects/50baa87c38433177ea000000/queries/extraction?api_key=8f963ce5138f4517b8d0a06af8eb36e4&timeframe='+encodeURIComponent(JSON.stringify(time))+'&event_collection=';
	var users = new Array();

	for (var o=0; o<pages.length; ++o ) {
		$.ajax({
			url: request+pages[o],
			async: false,
			success:function(data) {

				for (var i=0; i < data.result.length; ++i) {
					var switched = false;
					for (var j=0; j<users.length; ++j) {
						if ( users[j]["user_id"] == data.result[i]["user_id"] ) {
							switched = true;
							if ( users[j]["timestamp"] < data.result[i]["timestamp"] ) {
								data.result[i]["room"] = pages[o];
								users[j] = data.result[i];
							}
						}
					}
					if (switched == false) {
						data.result[i]["room"] = pages[o];
						users.push( data.result[i] );
					}
				}
			}
		});
	}

	var users1 = new Object();
	for (var i=0;i<users.length;++i) {
		users1[ users[i]["user_id"] ] = {room_id:users[i]["room"],referrer:users[i]["last_page"],timestamp:users[i]["timestamp"]};
	}

	return users1;
}



var previous = {};
var next = {};

setInterval(function(){
	next = get_latest_data_points();
	render(previous,next);
	previous = next;
},3000);

function add_to_averages(previous, next, previous_room, next_room) {
	var time_elapsed = parseInt(next) - parseInt(previous);
	
	if (previous_room == "index" &&
		(next_room == "3" || next_room == "2") ) {
		console.log(time_elapsed);
		time1 += time_elapsed;
		counthits1++;
	} else if (previous_room == "2" && next_room == "4") {
		time2 += time_elapsed;
		counthits2++;
	} else if (previous_room == "3" && next_room == "4") {
		time3 += time_elapsed;
		counthits3++;
	}
}

function render(previous,next)
{
	for(var index in next)
	{
		if (previous[index] == undefined)
		{
			addToRoom(index,next[index]["room_id"],next[index]["referrer"]);
		}
		else
		{
			moveToRoom(index,previous[index]["room_id"],next[index]["room_id"],previous[index]["timestamp"],next[index]["timestamp"]);
			delete previous[index];
		}	

	}

	for(var index in previous)
	{
		deleteFromRoom(index);
	}

	updateStats();
}

function updateStats()
{
	var count1 = $("#roomindex img").length;
	var count2 = $("#room2 img").length;
	var count3 = $("#room3 img").length;
	var count4 = $("#room4 img").length;
	var total = count1+count2+count3+count4;
	
	$("#total_count").html(total.toString());
	$("#converted_count").html(converted_count.toString()+' s');
	
	html1 = (counthits1 == 0) ? "0 s" : (time1/(1000*counthits1)).toFixed(2).toString()+' s';
	html2 = (counthits2 == 0) ? "0 s" : (time2/(1000*counthits2)).toFixed(2).toString()+' s';
	html3 = (counthits3 == 0) ? "0 s" : (time3/(1000*counthits3)).toFixed(2).toString()+' s';

	$("#room_1_average_time").html(html1);
	$("#room_2_average_time").html(html2);
	$("#room_3_average_time").html(html3);
}

function addToRoom(user_id,room_number,referrer)
{
	$("#room" + room_number).append(userIcon(user_id,referrer));
	showTooltip(user_id);
	fadeIcon(user_id);
}

function deleteFromRoom(user_id)
{
	$("#user" + user_id).remove();
}

function moveToRoom(user_id,past_room_number,new_room_number,prev_timestamp,next_timestamp)
{
	if (new_room_number!=past_room_number)
	{
		 var old_x = $("#room" + past_room_number).position().left;
		 var old_y = $("#room" + past_room_number).position().top;
		 var new_x = $("#room" + new_room_number).position().left;
		 var new_y = $("#room" + new_room_number).position().top;
	
		var top_string = "+=" + (new_y - old_y).toString();
		var left_string = "+=" + (new_x - old_x).toString();
			
		$("#user" + user_id).stop();
		
		$("#user" + user_id).animate({ 
			top: top_string,
			left: left_string
		}, 2000, function(){
			$("#user" + user_id).remove();
			$("#room" + new_room_number).append(userIcon(user_id,"From page " + past_room_number));
			showTooltip(user_id);
			fadeIcon(user_id);
		});
		add_to_averages(prev_timestamp, next_timestamp, past_room_number, new_room_number);
		if(new_room_number == "4")
		{
			converted_count += 1;
		}
	}
	else
	{
		if ($("#user" + user_id + " img").attr("src") != "https://s3.amazonaws.com/trakeen/" + user_id + ".jpg"  )
		{
			var poop_id = GUID();
			$("body").prepend("<img id='" + poop_id +  "' style='display:none' onerror='errorChex(this);' src='https://s3.amazonaws.com/trakeen/" + user_id + ".jpg'/>");
			setTimeout(function(){
				if($("#"+poop_id).attr("src")!="LOL")
				{
					$("#user" + user_id).html("<img onerror='imgError(this);' src='https://s3.amazonaws.com/trakeen/" + user_id + ".jpg'/>");
					$("#"+poop_id).remove();
				}
			},3000);
		}
	}
}


function errorChex(image){
    image.onerror = "";
    image.src = "LOL";
    return true;
}

function fadeIcon(user_id)
{
	$('#user' + user_id).fadeOut(70000);
}

function userIcon(user_id,referrer){
	//draws the user icon. LOL!
	if (referrer==undefined || referrer=="")
	{
		referrer= "Typed in URL!";
	}	
	
	
	return $("<span\>").addClass("user_icon").attr("id","user"+user_id).attr("rel", "tooltip").attr("title", referrer).html("<img onerror='imgError(this);' src='https://s3.amazonaws.com/trakeen/" + user_id + ".jpg'/>");	
}

function imgError(image){
    image.onerror = "";
    image.src = "../assets/user_small.png";
    return true;
}

function showTooltip(user_id){
	$("#user"+user_id).tooltip({'placement':'bottom', 'trigger' : 'manual'});
	$("#user"+user_id).tooltip();
	$("#user"+user_id).tooltip('show');
	setTimeout(function(){
		$("#user"+user_id).tooltip('hide');
	},4000);
}

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
