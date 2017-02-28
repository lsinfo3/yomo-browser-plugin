var data_array = "";
var currentlySending = false;

var socketTransportServiceYomo = undefined;
var socketTransportYomo = undefined;
var outputStreamYomo = undefined;
var isConnected = 0;
var sendcount = 0;

const host = "127.0.0.1";
const port = 60607;

function sendInformation() {
    if (!data_array) {
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        var millis = currentTime.getMilliseconds();
        //dump("[YOMO FF extension] Thread: "+ hours + ":" + minutes + ":" + seconds + "." + millis + " no data. Count: "+sendcount+"\n");
        return;
    }


    if (currentlySending) {

        // clear buffer if buffer is too large
        if (data_array.length > 1000) {
            data_array = "";
            currentlySending = false;
            dump("[YOMO FF extension] Thread: buffer overloaded, clearing... Maybe YoMo java is not connected.\n");
        }
        return;
    }



    // dump("[YOMO FF extension] Thread: Data array length: " + data_array.length + "\n");

    currentlySending = true;
    data_array += "##count: " + sendcount + "\n";
    var fullUrl = "http://" + host + ":" + port + "/" + escape(data_array);
    //dump("[YOMO FF extension] Thread: url: " + fullUrl + "\n");

    function infoReceived() {
        var output = httpRequest.responseText;
        var headers = httpRequest.getResponseHeader("count");
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        var millis = currentTime.getMilliseconds();

        //dump("[YOMO FF extension] Thread: "+ hours + ":" + minutes + ":" + seconds + "." + millis + " Received data: "+headers+"\n");
        if (output) {
            postMessage(output.trim());
        }

        currentlySending = false;
        httpRequest = undefined;
    }



    try {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", fullUrl, true);
        httpRequest.onload = function(e) {
            infoReceived();
        };
        httpRequest.send();
        data_array = "";
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        var millis = currentTime.getMilliseconds();
        //dump("[YOMO FF extension] Thread: "+ hours + ":" + minutes + ":" + seconds + "." + millis + " Sending data "+sendcount+"...\n");
        sendcount++;

    } catch (e) {
        dump("[YOMO FF extension] Thread: Error while sending data with XMLHttpRequest: " + e + "\n");
    }


    /*
    var output = "message to extension";
    if (output) {
    	postMessage(output.trim());
        	dump("post...\n");
    }
    */

}

setInterval(function() {
    sendInformation();
}, 100);

onmessage = function(event) {
    //dump("[YOMO FF extension] Thread: got data.\n");
    //dump("[YOMO FF extension] Thread: got data: " + event.data + "\n");
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var millis = currentTime.getMilliseconds();
    if (event.data) {
        data_array += event.data;
        // dump("[YOMO FF extension] Thread: "+ hours + ":" + minutes + ":" + seconds + "." + millis + " got message with data: " + event.data + "\n, " + data_array.length + " \n");
        // dump("[YOMO FF extension] Thread: "+ hours + ":" + minutes + ":" + seconds + "." + millis + " got message with data \n");
    } else {
        // dump("[YOMO FF extension] Thread: "+ hours + ":" + minutes + ":" + seconds + "." + millis + " Message but no Data \n");
    }
    sendInformation();
}