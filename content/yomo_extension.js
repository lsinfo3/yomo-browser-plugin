// YoMo, version 4.2, Anika, HTML5
// Florian Wamser, florian.wamser@informatik.uni-wuerzburg.de

// parts are based on youtubeautoreplay, license:
// Version: MPL 1.1/GPL 2.0/LGPL 2.1
// 
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
// 
// The Original Code is You Tube Auto Replay.
// 
// The Initial Developer of the Original Code is
// Arik Weizman.
// Portions created by the Initial Developer are Copyright (C) 2010
// the Initial Developer. All Rights Reserved.
// 
// Contributor(s):
// 
// Alternatively, the contents of this file may be used under the terms of
// either the GNU General Public License Version 2 or later (the "GPL"), or
// the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
// in which case the provisions of the GPL or the LGPL are applicable instead
// of those above. If you wish to allow use of your version of this file only
// under the terms of either the GPL or the LGPL, and not to allow others to
// use your version of this file under the terms of the MPL, indicate your
// decision by deleting the provisions above and replace them with the notice
// and other provisions required by the GPL or the LGPL. If you do not delete
// the provisions above, a recipient may use your version of this file under
// the terms of any one of the MPL, the GPL or the LGPL.
// 









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// inject code
// injects code at a single webpage
//  -> based on youtubeautoreplay, Arik Weizman
//
var yomo_inject_ytreplay = {
    _initialized: false,
    playerTags: ["video"],

    onLoad: function() {
        // init inject code
        if (this._initialized) {
            return;
        }
        this._initialized = true;

        // add listener
        window.document.addEventListener("DOMContentLoaded", yomo_inject_ytreplay.performLoadAction, false);
        yomo_debug.debug("____ DOMContent listener registered for injecting webpage module code.\n");
    },
    performLoadAction: function(e) {
        yomo_debug.debug("");
        yomo_debug.debug("=================================================");
        yomo_debug.debug("____ load action detected, try to search for relevant web pages for injecting code\n");
        var doc = e.originalTarget;
        var loc = window._content.location.href;
        var ysite = "youtube.com/watch?";
        if (doc.location.href.indexOf(ysite) != -1) {
            doc.addEventListener("DOMNodeInserted", function(ev) {
                yomo_inject_ytreplay.elementAdded(doc, ev);
            }, false);
            yomo_inject_ytreplay.addScripts(doc);
        }
    },
    elementAdded: function(doc, ev) {
        var ele = ev.originalTarget;
        if (yomo_inject_ytreplay.isElePlayer(ele)) {
            yomo_inject_ytreplay.addScripts(doc);
        }
    },
    isElePlayer: function(ele) {
        for (var i = 0; i < yomo_inject_ytreplay.playerTags.length; i++) {
            if (ele.id == yomo_inject_ytreplay.playerTags[i]) {
                return true;
            }
        }
        return false;
    },
    getPlayerInDoc: function(doc) {
        for (var i = 0; i < yomo_inject_ytreplay.playerTags.length; i++) {
            var ele = doc.getElementsByTagName(yomo_inject_ytreplay.playerTags[i])[0];
            if (ele) {
                return ele;
            }
        }
        return undefined;
    },
    addScripts: function(doc) {
        yomo_debug.debug("________ addScripts");

        var moviePlayer = yomo_inject_ytreplay.getPlayerInDoc(doc);
        if (moviePlayer) {
            try {
                yomo_inject_ytreplay.injectChromeScript(moviePlayer.parentNode, doc);
            } catch (e) {
                alert(e);
            }
        }
    },
    injectChromeScript: function(ele, doc) {
        yomo_debug.debug("________ injectChromeScript\n");

        var script = document.getElementById('replayScript');
        if (script) {
            return;
        }
        var req = new XMLHttpRequest();
        req.open("GET", "chrome://yomo-42/content/yomo_webpage_module.js");
        req.overrideMimeType('text/plain; charset=us-ascii');
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                script = doc.createElement('script');
                script.type = 'text/javascript';
                script.id = "yomo_script";
                script.innerHTML = req.responseText;
                ele.appendChild(script);
            }
        };
        req.send(null);
    },
    onUnload: function() {}
};
//
// inject code END
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// debug module
// offers file or message output
var yomo_debug = {
    _show_alerts: false,
    debug: function(msg) {
        if (this._show_alerts) alert(msg);
        if (yomo_settings.debug_messages_to_log) yomo_filewriting_debug.write("##D##", msg);

        var currentTime = new Date();
        var hours = currentTime.getHours().toString().replace(/^([0-9])$/, "0$1");
        var minutes = currentTime.getMinutes().toString().replace(/^([0-9])$/, "0$1");
        var seconds = currentTime.getSeconds().toString().replace(/^([0-9])$/, "0$1");
        dump('[YOMO FF extension] ' + hours + ":" + minutes + ":" + seconds + "  " + msg + "\n");
    }
};
//
// debug module END
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// webpage connection module
// is able to receive events from a webpage
//
var yomo_webpage_connection = {
    eventHandlerContinuousInfos: function(e) {
        // got an Event from page
        //yomo_debug.debug('got an event from page \n');

        // get content
        var infos = e.target.getAttribute("infos");

        // header
        var header = "##P##";

        yomo_filewriting_webpage_continuous.write(header, infos.trim());
        yomo_thread_based_sending.sendData(header + infos.replace(/\n/g, "##")); // thread-based sending




        // -> Video Information Object
        // TODO Florian

        // get content
        var infos = e.target.getAttribute("infos");
        //yomo_debug.debug("________ infos: " + infos);

        // parse videotime
        var infos_arr = infos.split(/\n/);
        var vt = 0;
        for (var i = 0; i < infos_arr.length; i++)
            if (infos_arr[i].match(/video_time:/))
                vt = infos_arr[i].replace(/video_time:[^0-9\.]+([0-9]+(\.[0-9]+)?)/g, "$1");
            //yomo_debug.debug("________ videotime: " + vt);

            // parse yomoid
        var yomoid = -1;
        for (var i = 0; i < infos_arr.length; i++)
            if (infos_arr[i].match(/yomoid:/))
                yomoid = infos_arr[i].replace(/yomoid:[^0-9]+([0-9]+)/g, "$1");
            //yomo_debug.debug("________ yomoID: " + yomoid);

            // parse video resolution
        var res = -1;
        for (var i = 0; i < infos_arr.length; i++)
            if (infos_arr[i].match(/quality:/))
                res = infos_arr[i].replace(/quality:[^a-z]+([a-z]+)/g, "$1");
            //yomo_debug.debug("________ quality: " + res);

            // parse video fraction
        var frac = -1;
        for (var i = 0; i < infos_arr.length; i++)
            if (infos_arr[i].match(/percentage_loaded:/))
                frac = infos_arr[i].replace(/percentage_loaded:[^0-9\.]+([0-9]+(\.[0-9]+)?)/g, "$1");
            //yomo_debug.debug("________ fraction of loaded bytes: " + frac);


        if (yomoid != -1 && !yomoid.match(/yomoid:/))
            yomo_videoinfos.setQuality(yomoid, res);

        if (yomoid != -1 && !yomoid.match(/yomoid:/))
            yomo_videoinfos.setVideoTime(yomoid, vt, infos);

        // -> Video Information Object END


    },

    eventHandlerEventInfos: function(e) {
        // got an Event from page
        //yomo_debug.debug('got an event from page \n');

        // get content
        var infos = e.target.getAttribute("infos");

        // header
        var header = "##P##";

         yomo_filewriting_webpage_event.write(header, infos.trim());
    }
};
// webpage connection module END
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// file writing module
// writes messages to a file
function yomo_writefile() {};

yomo_writefile.prototype = {
    _initialized: false,
    _filename_prefix: "yomo_output",
    _filename_suffix: "log",
	_filetype: "test",
    _file: undefined,
    _timer: undefined,
    _zip: true,
    _delete_old_log: true,
    _deleteTimeout: 1 * 60 * 60, // in seconds
    _print_header: true,

    init: function(type) {
        this._timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer); // setup timer object

        this._filename_prefix = yomo_settings.filename_prefix;
		this._filetype = type;
        this._filename_suffix = yomo_settings.filename_suffix;
        this._zip = yomo_settings.zip_log_files;
        this._delete_old_log = yomo_settings.delete_old_log;
        this._print_header = yomo_settings.print_header;
        this._deleteTimeout = yomo_settings.delete_timeout;
        yomo_debug.debug("____ filename prefix: " + this._filename_prefix);
        yomo_debug.debug("____ filename suffix: " + this._filename_suffix);
        yomo_debug.debug("____ zip old log files: " + this._zip);
        yomo_debug.debug("____ delete old log files: " + this._delete_old_log);
        yomo_debug.debug("____ delete timeout: " + this._deleteTimeout);
        yomo_debug.debug("____ print_header: " + this._print_header);

        // zip log orphans
        if (this._zip) this.zipLogOrphans();

        // delete old log files
        if (this._delete_old_log) this.deleteOldLogs();

        // open file for writing TODO open several files for each measurement type
        this.openFile();

        this._initialized = true;
    },

    _initDirectoryFileHandle: function() {
        if (yomo_settings.dir == "##TEMP##") {
            yomo_debug.debug("____ try to detect temporary directory for logfile output.");
            return Components.classes["@mozilla.org/file/directory_service;1"].
            getService(Components.interfaces.nsIProperties).
            get("TmpD", Components.interfaces.nsIFile);
        } else {
            var file = Components.classes["@mozilla.org/file/local;1"].
            createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(yomo_settings.dir);
            return file;
        }
    },

    openFile: function() {

        var file = this._initDirectoryFileHandle();

        var dateStr = new Date().getTime();
        file.append(this._filename_prefix + "_" + this._filetype + "_" + dateStr + "." + this._filename_suffix);
        file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        yomo_debug.debug("____ new file created for output: " + file.path);
        this._file = file;

        // log rotate
        var _logRotateTimeout = yomo_settings.logRotateTimeout;
        this._timer.initWithCallback(this, _logRotateTimeout, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    },

    notify: function() {
        // if zip
        if (this._zip) yomo_zip(this._file);

        // new log file
        this.openFile();
    },

    deleteOldLogs: function() {
        yomo_debug.debug("____ delete old log files...");
        // search for files according to filename in config
        var file = this._initDirectoryFileHandle();
        var entries = file.directoryEntries;

        // log file pattern
        var prefix = yomo_escape(this._filename_prefix);
        var suffix = yomo_escape(this._filename_suffix);
        var log_file_pattern = prefix + "_.+" + "\\." + suffix + "$";
        yomo_debug.debug("________  searching for log files according to the following pattern: " + log_file_pattern);
        var re = new RegExp(log_file_pattern);

        // for each
        while (entries.hasMoreElements()) {
            var entry = entries.getNext();
            entry.QueryInterface(Components.interfaces.nsIFile);

            // fitting to a log file
            if (re.test(entry.path)) {
                //yomo_debug.debug("________ found file: " + entry.path);

                // get current time
                var dateStr = new Date().getTime();

                //var logDate = parseInt(entry.path.substring(entry.path.length - suffix.length - 14, entry.path.length - suffix.length - 1)); // get date via filename
                var logDate = entry.lastModifiedTime;
                //yomo_debug.debug("________ log date: " + logDate);

                if ((dateStr - logDate) > this._deleteTimeout * 1000) {
                    yomo_debug.debug("________ removing file: " + entry.path);
                    try {
                        entry.remove(false);
                    } catch (e) {
                        yomo_debug.debug("________ Error, while removing log file: " + entry.path);
                    }

                }
            }
        }

        yomo_debug.debug("____ delete old log files done!");
    },

    zipLogOrphans: function() {
        yomo_debug.debug("____ zipping log file orphans...");
        // search for files according to filename in config
        var file = this._initDirectoryFileHandle();
        var entries = file.directoryEntries;

        // log file pattern
        var log_file_pattern = yomo_escape(this._filename_prefix) + "_.+" + "\\." + yomo_escape(this._filename_suffix) + "$";
        yomo_debug.debug("________  searching for log files according to the following pattern: " + log_file_pattern);
        var re = new RegExp(log_file_pattern);

        // for each
        while (entries.hasMoreElements()) {
            var entry = entries.getNext();
            entry.QueryInterface(Components.interfaces.nsIFile);

            // fitting to a log file
            if (re.test(entry.path)) {
                yomo_debug.debug("________ found file: " + entry.path);

                // zip to new file
                // delete old file
                yomo_zip(entry);
            }
        }

        yomo_debug.debug("____ zipping log file orphans done!");

    },


    write: function(header, msg) {
        if (!this._initialized) return;

        var currentTime = new Date().getTime();

        if (this._print_header)
            var data = '[YOMO] ' + currentTime + " | user: " + yomo_settings.userid + " | " + header + " | " + msg.replace(/\n/g, "##") + "\n";
        else
            var data = currentTime + "#" + msg + "\n";
        //yomo_debug.debug("________ data: " + data);

		//TODO use corresponding files for each measurement type

        Components.utils.import("resource://gre/modules/NetUtil.jsm");
        Components.utils.import("resource://gre/modules/FileUtils.jsm");

        // You can also optionally pass a flags parameter here. It defaults to  
        // FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;  
        var ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
        createInstance(Components.interfaces.nsIFileOutputStream);
        ostream.init(this._file, 0x02 | 0x08 | 0x10, 0644, 1);

        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        var istream = converter.convertToInputStream(data);

        try {
            // The last argument (the callback) is optional.  
            NetUtil.asyncCopy(istream, ostream, function(status) {
                if (!Components.isSuccessCode(status)) {
                    // Handle error!  
                    dump("Error while writing to log file!\n");
                    return;
                }

                // Data has been written to the file.  
            });

        } catch (e) {
            dump(e + "\n");
        }
    }
};
//
// file writing module END
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// network observer module
// captures the network request & searches for IP/port
//
var yomo_network = {

    _initialized: false,

    init: function fdm_init() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;

        try {
            var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            observerService.addObserver(yomo_httpRequestObserver, "http-on-modify-request", false);
            yomo_debug.debug("____ HTTP request header observer registered.");
        } catch (e) {
            yomo_debug.debug("ERROR: yomo_network.main could not create the observerService " + e);
        }
    },
    close: function() {
        try {
            var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            observerService.removeObserver(yomo_httpRequestObserver, "http-on-modify-request");
            yomo_debug.debug("____ HTTP request header observer unregistered.");
        } catch (e) {
            yomo_debug.debug("ERROR: yomo_network: could not unregister the observer service " + e);
        }
    }
};

// Listens for new HTTP requests and triggers port search
var yomo_httpRequestObserver = {
    arraySrcAdd: new Array(),
    arrayRemAdd: new Array(),
    arraySrcPort: new Array(),
    arrayRemPort: new Array(),
    count: 0,
    url_pattern: "/videoplayback?",

    observe: function(aSubject, aTopic, aData) {
        if (aTopic == "http-on-modify-request") {
            //yomo_debug.debug("________ yomo_httpRequestObserver received new http-on-modify-request");

            try {
                var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
                var url = aSubject.URI.spec;

                // only try to get port if url fits to URL pattern
                if (url.indexOf(this.url_pattern) != -1) {
                    var portTimer = new yomo_portTimer();
                    //yomo_debug.debug("________ yomo_portTimer: " + portTimer);
                    portTimer.channel = httpChannel;
                    portTimer.timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                    portTimer.url = aSubject.URI.spec;
                    //yomo_debug.debug("________ url: " + portTimer.url);
                    portTimer.notify();
                    this.count++;
                    //yomo_debug.debug("____ timer started");
                }

            } catch (e) {
                yomo_debug.debug("--> Error while setting up the timer to find connection settings: " + e);
            }
        }
    },
    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsIObserver) || aIID.equals(Components.interfaces.nsISupports)) {
            return this;
        }

        throw Components.results.NS_NOINTERFACE;
    }
};

// search for connection parameters with a timer
function yomo_portTimer() {
    this.channel = undefined;
    this.timer = undefined;
    this.url = undefined;
    this.trying_count = 1;
};

yomo_portTimer.prototype = {
    notify: function(portTimer) {
        var localPort;
        var localAddress;
        var remoteAddress;
        var remotePort;

        try {
            // try to determine ip and port with
            //yomo_debug.debug("____ Try to get connection...");
            var httpChannelInternal = this.channel.QueryInterface(Components.interfaces.nsIHttpChannelInternal);

            localAddress = httpChannelInternal.localAddress;
            localPort = httpChannelInternal.localPort;
            remoteAddress = httpChannelInternal.remoteAddress;
            remotePort = httpChannelInternal.remotePort;

        } catch (e) {
            //yomo_debug.debug("Error, could not get network parameters: " + e);
            //alert("Firefox Addon Error: Error while querying network parameters.\n Addon works for Gecko Engine 5 or greater.");

            localAddress = "undefined";
            localPort = -1;
            remoteAddress = "undefined";
            remotePort = -1;
        }


        if (localPort > 0) {
            yomo_httpRequestObserver.count--;
            yomo_httpRequestObserver.arraySrcAdd[this.url] = localAddress;
            yomo_httpRequestObserver.arrayRemAdd[this.url] = remoteAddress;
            yomo_httpRequestObserver.arraySrcPort[this.url] = localPort;
            yomo_httpRequestObserver.arrayRemPort[this.url] = remotePort;
            yomo_debug.debug("________ Found network settings: " + localAddress + ":" + localPort + "<->" + remoteAddress + ":" + remotePort + "\t\t#Timer: " + yomo_httpRequestObserver.count + "\t\tURL_hashcode: " + yomo_hashCode(this.url));

            // output
            var header = "##C##";
            yomo_filewriting_network.write(header, "url_hashcode: " + yomo_hashCode(this.url) + "##" + "connection: " + localAddress + ":" + localPort + "<->" + remoteAddress + ":" + remotePort);
            yomo_thread_based_sending.sendData(header + "url_hashcode: " + yomo_hashCode(this.url) + "##" + "connection: " + localAddress + ":" + localPort + "<->" + remoteAddress + ":" + remotePort); // thread-based sending

        } else if (this.trying_count < 5000) { // 10s 
            this.timer.initWithCallback(this, 2, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            this.trying_count++;
        } else {
            yomo_httpRequestObserver.count--;
            yomo_debug.debug("________ Found NO correct network settings: " + localAddress + ":" + localPort + "<->" + remoteAddress + ":" + remotePort + "\t\t#Timer: " + yomo_httpRequestObserver.count);
        }

    },

    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsITimer) || aIID.equals(Components.interfaces.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
};
//
// END searching for connection settings
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StreamListener: intersects the data stream and starts an external data parser with a Tracing Listener
// Addionally, it removes old conection parameters in URL vector 
// 
function yomo_StreamListener() {
    this.originalListener = undefined;
    this._yomoId = undefined;
    this._id = undefined;
    this._signature = undefined;
    this.url = undefined;
    this._file = undefined;
    this._filename = "yomo_output.flv";
    this._isactive = false;
    this._process = undefined;
    this._parserTimeout = 500; // in ms, (60s lang, jede 500ms)
    this._parserTimeoutCount = 2 * 60; // 60s lang, jede 500ms
    this._finish = false;
    this._rangeRequestMode = false;
    this._flvData = new Array();
    this._block = false;
    this._pipe = undefined;
    this._deleteTimeout = 1 * 60 * 60; // in seconds
    this._last_parser_run = undefined;
    this._parser_min_wait = 100; // in ms
}

yomo_StreamListener.prototype = {
        originalListener: undefined,
        _yomoId: undefined,
        _id: undefined,
        _signature: undefined,
        url: undefined,
        _file: undefined,
        _filename: "yomo_output.flv",
        _isactive: false,
        _process: undefined,
        _timer: undefined,
        _parserTimeout: 500, // in ms, (60s lang, jede 500ms)
        _parserTimeoutCount: 2 * 60, // 60s lang, jede 500ms
        _finish: false,
        _rangeRequestMode: false,
        _flvData: new Array(),
        _block: false,
        _pipe: undefined,
        _deleteTimeout: 1 * 60 * 60, // in seconds
        _last_parser_run: undefined,
        _parser_min_wait: 100, // in ms 

        onDataAvailable: function(request, context, inputStream, offset, count) {

            this._isactive = true;
            try {

                var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
                var binaryOutputStream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);

                binaryInputStream.setInputStream(inputStream);
                var storageStream = Components.classes["@mozilla.org/storagestream;1"].createInstance(Components.interfaces.nsIStorageStream);
                storageStream.init(8192, count, null);
                binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

                // Copy received data as they come.
                var data = binaryInputStream.readBytes(count);
                //yomo_debug.debug("Read flv data, number of bytes: " + data.length);
                binaryOutputStream.writeBytes(data, data.length);

                var pipe = this._pipe;
                var url = this.url;
                var o = this;
                pipe.outputStream.asyncWait({
                    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIOutputStreamCallback]),
                    onOutputStreamReady: function() {
                        try {
                            pipe.outputStream.write(data, data.length);
                            //yomo_debug.debug("data length: " + data.length + ", url hash: " + yomo_hashCode(url) + ", observer ID: " + o._id);

                            //var currDate = new Date().getTime();
                            // limit the parsing to each 100ms, especially if hd
                            //yomo_debug.debug("lr: " + o._last_parser_run);
                            //yomo_debug.debug(currDate);
                            //yomo_debug.debug("b: " + (currDate-o._last_parser_run));
                            //if ((currDate - o._last_parser_run) > o._parser_min_wait || yomo_videoinfos.available_playtime[o._yomoId] < 100) {

                            //yomo_debug.debug("Parsing video file");
                            //o.parseFile();
                            //o._parserTimeoutCount = 2*60;
                            // yomo_debug.debug("Read apt.");
                            // start reading it
                            //var reader = new yomo_readLastLine();
                            //reader.read(o._file.path + ".apt", o._yomoId, yomo_hashCode(o.url), o._id, o._signature);

                            //o._last_parser_run = currDate; // set timestamp
                            //}



                        } catch (e) {
                            //dump("Error while writing to pipe: " + e + "\n");

                            // first, close pipe outputstream
                            if (pipe.outputStream instanceof Components.interfaces.nsISafeOutputStream) {
                                pipe.outputStream.finish();
                                yomo_debug.debug("output stream finished, url hash: " + yomo_hashCode(url));
                            } else {
                                pipe.outputStream.close();
                                yomo_debug.debug("output stream closed, url hash: " + yomo_hashCode(url));
                            }

                            // probably pipe closed, I'll open a new one
                            o.initPipe();

                            // try to write again
                            pipe = o._pipe;
                            pipe.outputStream.write(data, data.length);
                            //yomo_debug.debug("remaining data written: " + data.length + ", url hash: " + yomo_hashCode(url));
                        }

                        o._parserTimeoutCount = 2 * 60;
                    }
                }, 0, 0, Services.tm.currentThread);


                this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), offset, count); // use istream, asyncWait is not supported by the onDataAvailable


            } catch (e) {
                dump("General error while writing to flv file: " + e + "\n");
            }

            this._isactive = false;
        },

        onStartRequest: function(request, context) {
            this._id = (new Date()).getTime();
            yomo_debug.debug(">>>>>> new video transport channel detected. Observer ID: " + this._id);

            if (!this._yomoId) {
                dump("Error yomoid is undefined.");
                return;
            }

            try {
                var httpChannel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
                this.url = httpChannel.URI.spec;
                yomo_debug.debug("YoMo ID: " + this._yomoId + " Request url hashcode: " + yomo_hashCode(this.url));
            } catch (e) {
                dump("Error while to determining request URL: " + e + "\n");
            }

            // delete old FLV files
            if (!yomo_settings.do_not_delete_temp_flv_file)
                this.deleteTmpFLVFiles();

            // initially set last_parser_run
            this._last_parser_run = (new Date()).getTime();

            // range request mode?
            if (this._rangeRequestMode) {
                yomo_debug.debug("Range request download algorithm: " + this._rangeRequestMode);

                // check if range is ok
                var currentRangeBegin = parseInt(this._rangeRequestMode.replace(/^\s+|\s+$/g, '').replace(/^([0-9]+)-.*$/g, "$1"));
                yomo_debug.debug("new range begin: " + currentRangeBegin);
                yomo_debug.debug("expected range begin: " + yomo_videoinfos.nextRegularRange[this._yomoId]);
                yomo_debug.debug("fits to last range?: " + (currentRangeBegin == yomo_videoinfos.nextRegularRange[this._yomoId]));

                if (currentRangeBegin != 13 && yomo_videoinfos.nextRegularRange[this._yomoId] && currentRangeBegin == yomo_videoinfos.nextRegularRange[this._yomoId]) {

                    // old code
                    // append since the range is in row
                    //if (!yomo_videoinfos.outputFile[this._yomoId]) {
                    //	dump("Error, file is undefined. It is not possible to append data.\n");
                    //	return;
                    //}

                    //yomo_debug.debug("Found expected range, will append data: " + yomo_videoinfos.outputFile[this._yomoId].path);
                    //this._file = yomo_videoinfos.outputFile[this._yomoId]; 
                    //this._pipe = yomo_videoinfos.outputPipe[this._yomoId];

                    // set next expected range
                    //if (this._rangeRequestMode) yomo_videoinfos.setNextRegularRange(this._yomoId,parseInt(this._rangeRequestMode.replace(/^\s+|\s+$/g,'').replace(/.+-([0-9]+)$/g,"$1"))+1);

                    yomo_debug.debug("Found expected range.");
                    yomo_debug.debug("Need to create new file");

                    var file = Components.classes["@mozilla.org/file/directory_service;1"].
                    getService(Components.interfaces.nsIProperties).
                    get("TmpD", Components.interfaces.nsIFile);
                    file.append(this._filename);
                    file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
                    yomo_debug.debug("New file created for output: " + file.path);
                    this._file = file;
                    yomo_videoinfos.addFile(this._yomoId, this._file.path);
                    yomo_videoinfos.setOutputFile(this._yomoId, this._file);

                    this.initPipe();

                    // if range set next range
                    if (this._rangeRequestMode) yomo_videoinfos.setNextRegularRange(this._yomoId, parseInt(this._rangeRequestMode.replace(/^\s+|\s+$/g, '').replace(/.+-([0-9]+)$/g, "$1")) + 1);

                } else {
                    yomo_debug.debug("Need to create new file");

                    var file = Components.classes["@mozilla.org/file/directory_service;1"].
                    getService(Components.interfaces.nsIProperties).
                    get("TmpD", Components.interfaces.nsIFile);
                    file.append(this._filename);
                    file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
                    yomo_debug.debug("New file created for output: " + file.path);
                    this._file = file;
                    yomo_videoinfos.fileList = new Array();
                    yomo_videoinfos.addFile(this._yomoId, this._file.path);
                    yomo_videoinfos.setOutputFile(this._yomoId, this._file);

                    if (currentRangeBegin != 0) {
                        yomo_debug.debug("Add magic bytes");

                        // FIXME magic bytes for HD videos with range request

                        // magic bytes for FLV
                        yomo_debug.debug("Add magic FLV bytes");
                        try {

                            var ostream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                            ostream.init(this._file, 0x04 | 0x08 | 0x20, 0644, 0);

                            // 	private byte[] additionalDataNewMagicCode = new byte[] { 0x46, 0x4c, 0x56, 0x01, 0x05, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00 }; //464C5601050000000900000000
                            var data = new Array();
                            data[0] = String.fromCharCode(0x46);
                            data[1] = String.fromCharCode(0x4c);
                            data[2] = String.fromCharCode(0x56);
                            data[3] = String.fromCharCode(0x01);
                            data[4] = String.fromCharCode(0x05);
                            data[5] = String.fromCharCode(0x00);
                            data[6] = String.fromCharCode(0x00);
                            data[7] = String.fromCharCode(0x00);
                            data[8] = String.fromCharCode(0x09);
                            data[9] = String.fromCharCode(0x00);
                            data[10] = String.fromCharCode(0x00);
                            data[11] = String.fromCharCode(0x00);
                            data[12] = String.fromCharCode(0x00);

                            ostream.write(data[0], 1);
                            ostream.write(data[1], 1);
                            ostream.write(data[2], 1);
                            ostream.write(data[3], 1);
                            ostream.write(data[4], 1);
                            ostream.write(data[5], 1);
                            ostream.write(data[6], 1);
                            ostream.write(data[7], 1);
                            ostream.write(data[8], 1);
                            ostream.write(data[9], 1);
                            ostream.write(data[10], 1);
                            ostream.write(data[11], 1);
                            ostream.write(data[12], 1);
                            if (ostream instanceof Components.interfaces.nsISafeOutputStream) {
                                ostream.finish();
                            } else {
                                ostream.close();
                            }
                        } catch (e) {
                            dump("Error while writing magic code to file: " + e + "\n");
                        }
                        yomo_debug.debug("Magic bytes added.");
                    }

                    this.initPipe();

                    yomo_videoinfos.resetAvailablePlaytime(this._yomoId);

                    // if range set next range
                    if (this._rangeRequestMode) yomo_videoinfos.setNextRegularRange(this._yomoId, parseInt(this._rangeRequestMode.replace(/^\s+|\s+$/g, '').replace(/.+-([0-9]+)$/g, "$1")) + 1);
                    //if (currentRangeBegin > 100) yomo_videoinfos.setNextRegularRange(this._yomoId,-1);  // DEBUG no not append next chunk

                }
            } else {

                yomo_debug.debug("Throttling download algorithm");

                yomo_videoinfos.resetAvailablePlaytime(this._yomoId);

                // FIXME kill other parsers

                var file = Components.classes["@mozilla.org/file/directory_service;1"].
                getService(Components.interfaces.nsIProperties).
                get("TmpD", Components.interfaces.nsIFile);
                file.append(this._filename);
                file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
                yomo_debug.debug("New file created for output: " + file.path + "\n");
                this._file = file;
                yomo_videoinfos.fileList = new Array();
                yomo_videoinfos.addFile(this._yomoId, this._file.path);
                yomo_videoinfos.setOutputFile(this._yomoId, this._file);

                this.initPipe();
            }

            this.originalListener.onStartRequest(request, context);

        },

        initPipe: function() {
            // setup pipe
            Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            Components.utils.import("resource://gre/modules/FileUtils.jsm");
            Components.utils.import("resource://gre/modules/Services.jsm");

            this._timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer); // setup timer object
            this._timer.initWithCallback(this, this._parserTimeout, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

            this._pipe = Components.classes["@mozilla.org/pipe;1"].createInstance(Components.interfaces.nsIPipe);
            this._pipe.init(true, true, 0, 0x8000, null); // const PR_UINT32_MAX = 0xffffffff;

            var fileStream = FileUtils.openFileOutputStream(this._file, FileUtils.MODE_APPEND | FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE);
            var o = this;
            // Connect the pipe to the file
            NetUtil.asyncCopy(this._pipe.inputStream, fileStream, function(result) {
                if (!Components.isSuccessCode(result))
                    yomo_debug.debug("Error writing file: " + result);
                else {
                    // stream is fully written to file
                    yomo_debug.debug("stream fully written. ID: " + o._id);

                    // do final parsing and schedule final reading
                    o._parserTimeoutCount = 2 * 60;

                    yomo_debug.debug("<< Ending. Start final reading to get right end value.");

                }
            });

            yomo_videoinfos.setOutputPipe(this._yomoId, this._pipe);


        },

        setYomoId: function(id) {
            this._yomoId = id;
        },
        setRequestId: function(id) {
            this._id = id;
        },
        setSignature: function(signature) {
            this._signature = signature;
        },



        setRangeRequestMode: function(mode) {
            this._rangeRequestMode = mode;
        },


        parseFile: function() {

            // if already running skip
            //yomo_debug.debug("===== Process: " + this._process);
            //yomo_debug.debug("===== Process name: " + this._process.processName);
            //yomo_debug.debug("===== Process is running?: " + this._process.isRunning);
            if (this._process && this._process.isRunning) {
                //yomo_debug.debug("there is already somebody parsing...");
                return;
            }
            //yomo_debug.debug("parsing... YoMo ID: " + this._yomoId + ", Hashcode URL: " + yomo_hashCode(this.url) + ", observer ID: " + this._id);

            // parsing process
            // get os version
            // Returns "WINNT" on Windows Vista, XP, 2000, and NT systems;  
            // "Linux" on GNU/Linux; and "Darwin" on Mac OS X. 
            var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
            //yomo_debug.debug("detected OS: " + osString);
            if (osString.toLowerCase() == "linux") {

                // choose between hd and sd parsing
                if (yomo_videoinfos.quality[this._yomoId] && (yomo_videoinfos.quality[this._yomoId] == 'small' || yomo_videoinfos.quality[this._yomoId] == 'medium' || yomo_videoinfos.quality[this._yomoId] == 'large')) {
                    //yomo_debug.debug("##use info wue parser!##");

                    // start parsing process
                    this._process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                    var procfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    procfile.initWithPath("/bin/bash"); // FIXME check for bash otherwise error
                    this._process.init(procfile);

                    var args = ["-c", "cd /tmp && java -jar /opt/yomo.xpi/yomo-parser.jar " + this._file.path + " > " + this._file.path + ".apt.tmp && cp " + this._file.path + ".apt.tmp " + this._file.path + ".apt > /dev/null 2> /dev/null"];
                    //yomo_debug.debug(args);
                    this._process.run(false, args, args.length);



                } else {

                    yomo_debug.debug("use mencoder for parsing!");

                    // start parsing process
                    this._process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                    var procfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    procfile.initWithPath("/bin/bash"); // FIXME check for bash otherwise error
                    this._process.init(procfile);

                    var args = ["-c", "cat " + yomo_videoinfos.fileList[this._yomoId].join(' ') + " | mencoder -idx -o /dev/null -ovc copy -nosound - 2> /dev/null > " + this._file.path + ".apt"];
                    //yomo_debug.debug(args);
                    this._process.run(false, args, args.length);
                }


            } else if (osString.toLowerCase() == "winnt") {

                this._process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                var procfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                procfile.initWithPath("c:\\windows\\system32\\cmd.exe"); // FIXME check for bash otherwise error
                this._process.init(procfile);

                var args = ["/C", "type"];
                args = args.concat(yomo_videoinfos.fileList[this._yomoId]);
                var end_args = ["2>", "nul", "|", yomo_settings.parser_binary, "-idx", "-o", "nul", "-ovc", "copy", "-nosound", "-", ">", this._file.path + ".apt.tmp", "2>", "nul", "&&", "copy", this._file.path + ".apt.tmp", this._file.path + ".apt", ">", "nul", "2>&1"];
                args = args.concat(end_args);
                //yomo_debug.debug("cmd: " + args.join(" "));
                this._process.run(false, args, args.length);
            }
            //yomo_debug.debug("=== Parser started. YoMo ID: " + this._yomoId + ", Hashcode URL: " + yomo_hashCode(this.url) + ", file: " + this._file.path);
        },

        onStopRequest: function(request, context, statusCode) {

            // forward stop request
            yomo_debug.debug("<<<<<< stop of tracing listener. Download finished. YoMo ID: " + this._yomoId + ", Hashcode URL: " + yomo_hashCode(this.url) + ", observer ID: " + this._id);

            this.originalListener.onStopRequest(request, context, statusCode);

            // schedule reading
            this._parserTimeoutCount = 2 * 60;
            this._timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer); // setup timer object
            this._timer.initWithCallback(this, this._parserTimeout, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

            //yomo_debug.debug("onStopRequest try to remove url");
            try {
                var httpChannel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
                this.url = httpChannel.URI.spec;
                yomo_debug.debug("Removing url: " + yomo_hashCode(this.url) + ", YoMo ID: " + this._yomoId);

                try {
                    delete yomo_httpRequestObserver.arraySrcPort[this.url];
                    delete yomo_httpRequestObserver.arraySrcAdd[this.url];
                    delete yomo_httpRequestObserver.arrayRemAdd[this.url];
                    delete yomo_httpRequestObserver.arrayRemPort[this.url];
                } catch (e) {
                    yomo_debug.debug("--> Error while clearing entry from array: " + e);
                }

                //yomo_debug.debug("-----------------------------REMOVING");
                //for(var i in yomo_httpRequestObserver.arraySrcPort) {
                //	yomo_debug.debug(i);
                //}
                //yomo_debug.debug("-----------------------------REMOVING");
            } catch (e) {
                yomo_debug.debug("--> Error while onStopRequest: " + e);
            }
        },

        killParser: function() {

            // kill parser
            try {
                //yomo_debug.debug("===== Process: " + this._process);
                //yomo_debug.debug("===== Process name: " + this._process.processName);
                //yomo_debug.debug("===== Process is running?: " + this._process.isRunning);
                //if (this._process.isRunning) yomo_debug.debug("===== Process pid: " + this._process.pid);

                if (this._process && this._process.isRunning) {
                    this._process.kill();

                }
                //else if (this._process && !this._process.isRunning)
                //	yomo_debug.debug("Process already stopped.");
                //else 
                //	yomo_debug.debug("Process undefined.");

            } catch (e) {
                dump("Error while killing parser: " + e + "\n");
            }

            //try {
            //	yomo_debug.debug("===== Process 2: " + this._process);
            //	yomo_debug.debug("===== Process name 2: " + this._process.processName);
            //	yomo_debug.debug("===== Process is running? 2: " + this._process.isRunning);
            //	if (this._process.isRunning) yomo_debug.debug("===== Process pid 2: " + this._process.pid);
            //} catch(e) {
            //	dump("Error while killing parser: " + e + "\n");
            //}

            try {
                // if online method with tail is used, only the bash process is killed and sometimes not the tail and/or mencoder
                // kill tail and/or mencoder
                var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
                //yomo_debug.debug("detected OS: " + osString);
                if (osString.toLowerCase() == "linux") {

                    // linux
                    var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                    var procfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    procfile.initWithPath("/usr/bin/pkill"); // FIXME check for bash otherwise error
                    process.init(procfile);

                    var args = ["-f", this._file.path];
                    process.run(true, args, args.length);

                } else if (osString.toLowerCase() == "winnt") {

                    var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                    var procfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    procfile.initWithPath("c:\\windows\\system32\\taskkill.exe"); // FIXME check path
                    process.init(procfile);

                    var args = ["/F", "/IM", "mencoder.exe"];
                    process.run(true, args, args.length);
                    yomo_debug.debug("===== mencoder killed: " + args);
                }
            } catch (e) {
                dump("Error while killing parser: " + e + "\n");
            }

            //try {
            //	yomo_debug.debug("===== Process 3: " + this._process);
            //	yomo_debug.debug("===== Process name 3: " + this._process.processName);
            //	yomo_debug.debug("===== Process is still running? 3: " + this._process.isRunning);
            //	if (this._process.isRunning) yomo_debug.debug("===== Process pid 3: " + this._process.pid);
            //} catch(e) {
            //	dump("Error while killing parser: " + e + "\n");
            //}	

            yomo_debug.debug("===== Parser stopped. YoMo ID: " + this._yomoId + ", Hashcode URL: " + yomo_hashCode(this.url));


        },

        notify: function() {
            // got timeout 
            // yomo_debug.debug("got timeout: " + this._parserTimeoutCount);

            // only start final parsing if the url is still valid
            if (yomo_videoinfos.urlHash[this._yomoId] && (yomo_hashCode(this.url) == yomo_videoinfos.urlHash[this._yomoId])) {

                //yomo_debug.debug("Parsing video file");
                this.parseFile();

                //yomo_debug.debug("Read apt.");
                // start reading it
                var reader = new yomo_readLastLine();
                reader.read(this._file.path + ".apt", this._yomoId, yomo_hashCode(this.url), this._id, this._signature);
                //yomo_debug.debug("read scheduled.");

                // schedule again
                this._parserTimeoutCount--;
                if (this._parserTimeoutCount > 0)
                    this._timer.initWithCallback(this, this._parserTimeout, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
                else if (this._parserTimeoutCount > -10) {

                    yomo_debug.debug("END OF STREAM--------------------------------------------------------------------------------------------------------\n\n");
                    // kill all parsers now (sometimes some parsers get stuck..)
                    this.killParser();

                }
            } else {
                yomo_debug.debug("URL outdated. No final parsing. url hash: " + yomo_hashCode(this.url) + ", current hash to yomoid: " + yomo_videoinfos.urlHash[this._yomoId]);
            }

        },

        deleteTmpFLVFiles: function() {
            yomo_debug.debug("____ delete old tmp files...");

            // search for files in temp dir
            var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
            var entries = file.directoryEntries;

            // log file pattern
            var prefix = this._filename.replace(/^(.+)\.[^\.]+$/g, '$1');
            var suffix = this._filename.replace(/^.+(\.[^\.]+)$/g, '$1');
            //yomo_debug.debug("________  suffix: " + prefix);
            //yomo_debug.debug("________  prefix: " + suffix);
            var log_file_pattern = yomo_escape(prefix) + "(-[0-9]+)?(" + yomo_escape(suffix) + "|" + yomo_escape(suffix) + "\\.apt|" + yomo_escape(suffix) + "\\.apt\\.tmp)$";
            //yomo_debug.debug("________  searching for log files according to the following pattern: " + log_file_pattern);
            var re = new RegExp(log_file_pattern);

            // for each
            while (entries.hasMoreElements()) {
                var entry = entries.getNext();
                entry.QueryInterface(Components.interfaces.nsIFile);

                // fitting to a log file
                if (re.test(entry.path)) {
                    //yomo_debug.debug("________ found FLV file: " + entry.path);

                    // get current time
                    var dateStr = new Date().getTime();

                    var logDate = entry.lastModifiedTime;
                    //yomo_debug.debug("________ FLV file date: " + logDate);

                    if ((dateStr - logDate) > this._deleteTimeout * 1000) {
                        yomo_debug.debug("________ removing FLV temp file: " + entry.path);
                        try {
                            entry.remove(false);
                        } catch (e) {
                            dump("Error, while deleting file: " + entry.path + "\n");
                        }
                    }
                }
            }

            yomo_debug.debug("____ delete old FLV temp files done!");
        },

        QueryInterface: function(aIID) {
            if (aIID.equals(Components.interfaces.nsIStreamListener) ||
                aIID.equals(Components.interfaces.nsISupports)) {
                return this;
            }
            throw Components.results.NS_NOINTERFACE;
        }
    }
    //
    // END tracing listener
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Response header observer 
//    checks for a range request of YouTube Flash player
//
var yomo_httpResponseObserver = {
    url_pattern: "/videoplayback?",
    _initialized: false,
    observerService: undefined,

    init: function() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;

        // register itself
        this.observerService = Components.classes["@mozilla.org/network/http-activity-distributor;1"]
            .getService(Components.interfaces.nsIHttpActivityDistributor);
        this.register();
    },

    // observe function
    observeActivity: function(aHttpChannel, aActivityType, aActivitySubtype, aTimestamp, aExtraSizeData, aExtraStringData) {

        // only HTTP action is interesting
        if (aActivityType == Components.interfaces.nsIHttpActivityObserver.ACTIVITY_TYPE_HTTP_TRANSACTION) {


            // and hereon only response header is interesting
            // HTTP response header
            switch (aActivitySubtype) {
                case Components.interfaces.nsIHttpActivityObserver.ACTIVITY_SUBTYPE_RESPONSE_HEADER:

                    // received response header
                    var httpChannel;
                    var url;
                    try {
                        httpChannel = aHttpChannel.QueryInterface(Components.interfaces.nsIHttpChannel);
                        url = httpChannel.URI.spec;
                    } catch (e) {
                        yomo_debug.debug("Error, could not get http channel or url: " + e);
                        return;
                    }

                    //yomo_debug.debug("");
                    //yomo_debug.debug("+++++++ found an HTTP request: " + url);

                    if (url.indexOf(this.url_pattern) != -1) {

                        yomo_debug.debug("--------------------------------------------------------------------------------------------------------");
                        yomo_debug.debug("________ #YOUTUBE REQUEST# There was a HTTP request fitting to the pattern (" + this.url_pattern + ")");

                        // extract range parameter
                        var range_parameter = undefined;
                        if (url.indexOf("range=") != -1) range_parameter = url.replace(/^.+range=([0-9]+-[0-9]+)(&.+)?$/, "$1");
                        yomo_debug.debug("________ Detected range: " + range_parameter);

                        // extract begin parameter
                        var begin_parameter = undefined;
                        if (url.indexOf("begin=") != -1) begin_parameter = url.replace(/^.+begin=([0-9]+)(&.+)?$/, "$1");
                        yomo_debug.debug("________ Detected begin of jump: " + begin_parameter);

                        // extract begin parameter
                        var id_parameter = undefined;
                        if (url.indexOf("id=") != -1) id_parameter = url.replace(/^.+id=([-_0-9a-zA-Z\.]+)(&.+)?$/, "$1");
                        yomo_debug.debug("________ Detected id in request: " + id_parameter);

                        // extract mime parameter
                        var mime_parameter = undefined;
                        if (url.indexOf("mime=") != -1) mime_parameter = decodeURIComponent(url.replace(/^.+mime=([-_0-9a-zA-Z\.%]+)(&.+)?$/, "$1"));
                        yomo_debug.debug("________ Detected mime-tag in request: " + mime_parameter);

                        // extract itag parameter
                        var itag_parameter = undefined;
                        if (url.indexOf("itag=") != -1) itag_parameter = url.replace(/^.+itag=([0-9]+)(&.+)?$/, "$1");
                        yomo_debug.debug("________ Detected itag in request: " + itag_parameter);

                        // extract begin parameter
                        var algorithm_parameter = undefined;
                        if (url.indexOf("algorithm=") != -1) algorithm_parameter = url.replace(/^.+algorithm=([0-9a-zA-Z\.\-_]+)(&.+)?$/, "$1");
                        yomo_debug.debug("________ Detected algorithm in request: " + algorithm_parameter);

                        // extract signature
                        var player_signature = url.replace(/^.+signature=([0-9a-zA-Z\.]+)(&.+)?$/, "$1");
                        yomo_debug.debug("________ Signature: " + player_signature);

                        // generate a request id	
                        var request_id = (new Date()).getTime();
                        yomo_debug.debug("________ Request ID: " + request_id);

                        yomo_debug.debug("________ URL_hashcode: " + yomo_hashCode(url) + "\t\tURL: " + url);
                        //yomo_debug.debug("________ aTimestamp: " + aTimestamp);
                        //yomo_debug.debug("________ aExtraSizeData: " + aExtraSizeData);
                        //yomo_debug.debug("________ aExtraStringData: " + aExtraStringData);

                        // try to get stream
                        if (yomo_settings.use_external_parser) {
                            var newListener = undefined;
                            try {
                                httpChannel.QueryInterface(Components.interfaces.nsITraceableChannel);
                                newListener = new yomo_StreamListener();
                                if (range_parameter)
                                    newListener.setRangeRequestMode(range_parameter);
                                newListener.originalListener = httpChannel.setNewListener(newListener);
                            } catch (e) {
                                dump("Error while setting up the stream listener: " + e + "\n");
                            }
                        }



                        var gBrow = this.getWindowFromResponse(aHttpChannel);
                        var doc = gBrow.contentDocument;
                        yomo_debug.debug("________ document location: " + doc.location);

                        // add yomo id to map URL/IP-Port pair to yomo flash player
                        var yomoid;
                        var yomoid_element = doc.getElementById("yomo-id");

                        if (yomoid_element) {
                            // yomoid already included
                            yomo_debug.debug("________ Element top YoMo ID found: " + doc.getElementById("yomo-id").getAttribute("identifier") + ", updating entry");
                            yomoid = yomoid_element.getAttribute("identifier");
                            yomo_debug.debug("________ YoMo ID: " + yomoid);
                        } else {
                            yomo_debug.debug("________ inject (or wait for injected) YoMo ID!");
                            try {
                                // generate unique ID
                                yomoid = Math.floor(Math.random() * 10000000);

                                // inject unique ID
                                yomoID = doc.createElement('yomo-id');
                                yomoID.id = "yomo-id";
                                yomoID.setAttribute("identifier", yomoid);

                                for (var i = 0; i < yomo_inject_ytreplay.playerTags.length; i++) {
                                    var ele = doc.getElementsByTagName(yomo_inject_ytreplay.playerTags[i])[0];
                                    ele.appendChild(yomoID);
                                }
                                yomo_debug.debug("________ YoMo ID injected: " + yomoid);
                            } catch (e) {
                                yomo_debug.debug("--> Error while injecting YoMo ID: " + e);
                            }
                        }

                        // YoMo ID is known now
                        if (yomo_settings.use_external_parser) newListener.setYomoId(yomoid);
                        if (yomo_settings.use_external_parser) newListener.setRequestId(request_id);
                        if (yomo_settings.use_external_parser) newListener.setSignature(player_signature);
                        yomo_videoinfos.setUrlHash(yomoid, yomo_hashCode(url));
                        if (begin_parameter) yomo_videoinfos.setBeginParameter(yomoid, (parseFloat(begin_parameter) / 1000));

                        // output response header + yomoid
                        var qHeader = "##Q##";
                        var qData = "yomoid: " + yomoid + "##" + "signature: " + player_signature + "##" + "request_id: " + request_id + "##" + "response_header: " + aExtraStringData.replace(/[\n\r]/g, "%%");
                        yomo_filewriting_response_header.write(qHeader, qData);

                        // request information
                        var rHeader = "##R##";
                        var rData = "yomoid: " + yomoid + "##" + "signature: " + player_signature + "##" + "request_id: " + request_id + "##" + "url: " + url + "##" + "url_hashcode: " + yomo_hashCode(url) + "##algorithm: " + algorithm_parameter + "##range: " + range_parameter + "##begin_parameter: " + begin_parameter + "##" + "id_parameter: " + id_parameter + "##mime: " + mime_parameter + "##itag: " + itag_parameter + "##timestamp_other_data: " + (new Date).getTime();
                        yomo_filewriting_response_header.write(rHeader, rData);
                        yomo_thread_based_sending.sendData(rHeader + rData);

                        yomo_debug.debug("--------------------------------------------------------------------------------------------------------\n\n");
                    }
            }
        }
    },

    register: function() {
        this.observerService.addObserver(this);
        yomo_debug.debug("____ HTTP Response header observer registered.\n");
    },

    unregister: function() {
        this.observerService.removeObserver(this);
        yomo_debug.debug("____ HTTP Response Observer unregistered.\n");
    },


    getWindowFromResponse: function(aSubject) {
        var oHttp = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
        var interfaceRequestor = oHttp.notificationCallbacks.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
        var loadContext;
        try {
            loadContext = interfaceRequestor.getInterface(Components.interfaces.nsILoadContext);
        } catch (ex) {
            try {
                loadContext = aSubject.loadGroup.notificationCallbacks.getInterface(Components.interfaces.nsILoadContext);
            } catch (ex2) {
                loadContext = null;
                yomo_debug.debug("--> Error while detecting youtube browser window: " + e);
            }
        }
        if (loadContext) {
            var contentWindow = loadContext.associatedWindow; //this is the HTML window of the page that just loaded
            var aDOMWindow = contentWindow.top.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
            //yomo_debug.debug("________ DOM window object: " + aDOMWindow);
            return aDOMWindow.gBrowser;
        } else
            yomo_debug.debug("--> Error while detecting youtube browser window: " + e);
    }
};
//
// END Response header observer
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reads buffered playtime of filesystem
//
function yomo_readLastLine() {};

yomo_readLastLine.prototype = {
        read: function(filename, yomoid, urlHash, request_id, signature) {
            //yomo_debug.debug("____ reading last line of file " + filename + " started. YoMo ID: " + yomoid + ", urlHash: " + urlHash);

            try {

                Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
                Components.utils.import("resource://gre/modules/NetUtil.jsm");
                Components.utils.import("resource://gre/modules/FileUtils.jsm");

                var file = new FileUtils.File(filename);

                if (!file.exists()) {
                    //yomo_debug.debug("________ File to read does not exist. Filename: " + filename);
                    return;
                }
                //yomo_debug.debug("________ File opened: " + file.path);

                var uri = NetUtil.ioService.newFileURI(file);
                var channel = NetUtil.ioService.newChannelFromURI(uri);

                //yomo_debug.debug("________  asyncOpen. YoMo ID: " + yomoid + ", urlHash: " + urlHash);
                channel.asyncOpen({
                    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIRequestObserver, Components.interfaces.nsIStreamListener]),
                    onStartRequest: function(request, context) {
                        //yomo_debug.debug("________  start. YoMo ID: " + yomoid + ", urlHash: " + urlHash);
                    },
                    onDataAvailable: function(request, context, stream, offset, count) {
                        //yomo_debug.debug("________ avail. YoMo ID: " + yomoid + ", urlHash: " + urlHash);
                        var data = NetUtil.readInputStreamToString(stream, count);
                        var dataLines = data.split(/\n/);

                        // parse last 10 lines to find last "Pos:"
                        var apt = -1;
                        for (i = 0; i <= 10; i++) {
                            lastLine = dataLines[dataLines.length - i - 1];
                            //yomo_debug.debug("____________ Last line: [" + i + "] "+ lastLine);
                            if (lastLine) {
                                if (lastLine.match(/Pos:[^0-9\.]*([0-9]+(\.[0-9]+)?)s/)) {
                                    //\000-\\015 + Pos: ...
                                    apt = parseFloat(lastLine.replace(/[\0-\x1F]/g, "").replace(/^.*Pos:[^0-9\.]*([0-9]+(\.[0-9]+)?)s.*$/g, "$1"));
                                    //yomo_debug.debug("____________ apt: " + apt + ", YoMo ID: " + yomoid + ", urlHash: " + urlHash);
                                    //yomo_debug.debug("____________ yomoid: " + yomoid);
                                    //yomo_debug.debug("____________ urlHash: " + urlHash);
                                    //yomo_debug.debug("____________ request_id: " + request_id);
                                    //yomo_debug.debug("____________ signature: " + signature);

                                    if (yomoid & request_id)
                                        yomo_videoinfos.setAvailablePlaytime(yomoid, apt, urlHash, request_id, signature);
                                    break;
                                }
                            }
                        }

                        if (apt == -1) {
                            yomo_debug.debug("===> Could not parse FLV file.");
                            //yomo_videoinfos.resetAvailablePlaytime(yomoid);
                        }

                    },
                    onStopRequest: function(request, context, result) {
                        if (!Components.isSuccessCode(result))
                            yomo_debug.debug("Failed to read file, error code " + result + ", file: " + filename);
                    }
                }, null);


            } catch (e) {
                dump("Error while reading file: " + e + "\n");
            }
            //yomo_debug.debug("____ reading done.");


        },
    }
    // 
    // END read last line of file
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Yomo Video Info Object
// TODO replace yomo_writefile by custom writefile-object defined in MAIN
var yomo_videoinfos = {
        videotime: new Array(), // yomoid to videotime
        available_playtime: new Array(), // yomoid to buffered playtime
        quality: new Array(), // yomoid to current quality
        nextRegularRange: new Array(), // yomoid to next regular range request
        startTime: new Array(), // yomoid to startTime
        fileList: new Array(), // list all flv files for one yomoid
        outputPipe: new Array(), // pipe which is connected to a certain dump file 
        outputFile: new Array(), // file object that is the output dump file
        videoParser: new Array(), // videoParser object
        beginParameter: new Array(), // yomoid to *last* HTTP request parameter "begin"
        urlHash: new Array(), // yomoid to *last* FLV URL hashcode

        setVideoTime: function(yomoid, videotime, infos) {
            this.videotime[yomoid] = videotime;

            // parse video fraction
            var frac = -1;
            var infos_arr = infos.split(/\n/);
            for (var i = 0; i < infos_arr.length; i++)
                if (infos_arr[i].match(/percentage_loaded:/))
                    frac = infos_arr[i].replace(/percentage_loaded:[^0-9\.]+([0-9]+(\.[0-9]+)?)/g, "$1");

            var dur = -1;
            var infos_arr = infos.split(/\n/);
            for (var i = 0; i < infos_arr.length; i++)
                if (infos_arr[i].match(/duration:/))
                    dur = infos_arr[i].replace(/duration:[^0-9\.]+([0-9]+(\.[0-9]+)?)/g, "$1");



                //yomo_debug.debug("________ VT: [" + yomoid + "] -> " + videotime);

                //yomo_debug.debug("________ starttime: " + this.startTime[yomoid] + ", YoMo ID: " + yomoid);
                //yomo_debug.debug("________ starttime2: " + (this.startTime[yomoid] == 0) + ", YoMo ID: " + yomoid);
            if (this.startTime[yomoid] && (this.startTime[yomoid] == -1)) {
                this.startTime[yomoid] = this.videotime[yomoid];
                this.available_playtime[yomoid] = this.videotime[yomoid];
                yomo_debug.debug("start time set to: " + this.startTime[yomoid] + ", YoMo ID: " + yomoid);
                yomo_debug.debug("\n" + infos);
            }

            try {
                if (this.available_playtime[yomoid] != -1 && this.startTime[yomoid] != -1) {

                    if (yomo_settings.use_external_parser)
                        yomo_debug.debug("[YoMo ID: " + yomoid + ", Time: " + (new Date()).getTime() + "] \tVT: " + parseFloat(this.videotime[yomoid]).toFixed(2) + "\tAPT: " + parseFloat(this.available_playtime[yomoid]).toFixed(2) + "\tBPT: " + parseFloat(this.available_playtime[yomoid] - this.videotime[yomoid]).toFixed(2) + "\tFBT: " + parseFloat(frac * dur - this.videotime[yomoid]).toFixed(2) + " Q: " + this.quality[yomoid]);
                    else
                        yomo_debug.debug("[YoMo ID: " + yomoid + ", Time: " + (new Date()).getTime() + "] \tVT: " + parseFloat(this.videotime[yomoid]).toFixed(2) + "\tFBT: " + parseFloat(frac * dur - this.videotime[yomoid]).toFixed(2) + " Q: " + this.quality[yomoid]);

                    // write to log
                    var header = "##B##";
                    yomo_writefile.write(header, "yomoid: " + yomoid + "##VT: " + parseFloat(this.videotime[yomoid]).toFixed(3) + "##FBT: " + parseFloat(frac * dur - this.videotime[yomoid]).toFixed(3) + "##BPT: " + parseFloat(this.available_playtime[yomoid] - this.videotime[yomoid]).toFixed(3) + "##APT: " + parseFloat(this.available_playtime[yomoid]).toFixed(3) + "##S: " + parseFloat(this.startTime[yomoid]).toFixed(3));
                    yomo_thread_based_sending.sendData(header + "yomoid: " + yomoid + "##VT: " + parseFloat(this.videotime[yomoid]).toFixed(3) + "##FBT: " + parseFloat(frac * dur - this.videotime[yomoid]).toFixed(3) + "##BPT: " + parseFloat(this.available_playtime[yomoid] - this.videotime[yomoid]).toFixed(3) + "##APT: " + parseFloat(this.available_playtime[yomoid]).toFixed(3) + "##S: " + parseFloat(this.startTime[yomoid]).toFixed(3) + "##timestamp_other_data: " + (new Date).getTime()); // thread-based sending
                }
            } catch (e) {
                yomo_debug.debug("e: " + e);
            }

        },

        setAvailablePlaytime: function(yomoid, parsed_time, urlHash, request_id, signature) {

            // if it is data of outdated stream skip this available playtime
            if (this.urlHash[yomoid] && (urlHash != this.urlHash[yomoid])) {
                yomo_debug.debug("________ These are old information: " + parsed_time + " I'll skip this. YoMo ID: " + yomoid + ", urlHash of data: " + urlHash + ", urlHash of YoMo ID: " + this.urlHash[yomoid]);
                return;
            }

            var apt = parseFloat(parsed_time);

            // if there is a startup value add it to apt
            if (this.startTime[yomoid]) {
                apt += parseFloat(this.startTime[yomoid]);
                //yomo_debug.debug("________ parsed_time: " + parsed_time + ", startup_time: " + this.startTime[yomoid] + ", apt: " + apt);
                var header = "##T##";
                yomo_writefile.write(header, "yomoid: " + yomoid + "##" + "parsed_time: " + parseFloat(parsed_time).toFixed(3) + "##starttime: " + parseFloat(this.startTime[yomoid]).toFixed(3) + "##APT: " + parseFloat(apt).toFixed(3));

            }

            // send available playback time
            var aHeader = "##A##";
            var aData = "yomoid: " + yomoid + "##signature: " + signature + "##request_id: " + request_id + "##APT: " + apt;
            yomo_writefile.write(aHeader, aData);
            // yomo_thread_based_sending.sendData(aHeader + aData);

            // check if apt is decreasing
            if ((!this.available_playtime[yomoid]) || (this.available_playtime[yomoid] <= apt))
                this.available_playtime[yomoid] = apt;
            //else
            //yomo_debug.debug("________ Probably parse error!? Available playtime decreased. Ignoring the value. current value: " + this.available_playtime[yomoid] + ", new value to set: " + apt);
            //yomo_debug.debug("APT: [" + yomoid + "] -> " + apt);
        },

        resetAvailablePlaytime: function(yomoid) {
            this.available_playtime[yomoid] = -1;

            if (this.beginParameter[yomoid]) {
                this.startTime[yomoid] = this.beginParameter[yomoid];
                yomo_debug.debug("________ APT reset, startTime set to " + this.startTime[yomoid]);
            } else {
                this.startTime[yomoid] = -1; // schedule next videotime for startup time
                yomo_debug.debug("________ reset and schedule setup of next videotime to startTime!");
            }
        },

        setUrlHash: function(yomoid, urlHash) {
            this.urlHash[yomoid] = urlHash;
            yomo_debug.debug("________ New URL hashcode set: " + this.urlHash[yomoid] + ", YoMo ID: " + yomoid);
        },

        setOutputPipe: function(yomoid, pipe) {
            this.outputPipe[yomoid] = pipe;
            yomo_debug.debug("________ New pipe set: " + this.outputPipe[yomoid] + ", YoMo ID: " + yomoid);
        },

        setBeginParameter: function(yomoid, begin) {
            this.beginParameter[yomoid] = parseFloat(begin);
            yomo_debug.debug("________ New begin parameter set: " + this.beginParameter[yomoid] + ", YoMo ID: " + yomoid);
        },

        setOutputFile: function(yomoid, file) {
            this.outputFile[yomoid] = file;
            yomo_debug.debug("________ New file object set: " + this.outputFile[yomoid] + ", YoMo ID: " + yomoid);
        },

        setVideoParser: function(yomoid, parser) {
            this.videoParser[yomoid] = parser;
            yomo_debug.debug("________ New parser object set: " + this.videoParser[yomoid] + ", YoMo ID: " + yomoid);
        },


        addFile: function(yomoid, newFile) {
            var len = 0;
            if (!this.fileList[yomoid])
                this.fileList[yomoid] = new Array();
            len = this.fileList[yomoid].length;
            this.fileList[yomoid][len] = newFile;
            yomo_debug.debug("________ fileList: " + this.fileList[yomoid]);
        },


        setNextRegularRange: function(yomoid, next_range) {
            this.nextRegularRange[yomoid] = next_range;
            yomo_debug.debug("________ Next regular range: " + this.nextRegularRange[yomoid] + ", YoMo ID: " + yomoid);
        },

        setQuality: function(yomoid, quality) {
            if ((!this.quality[yomoid]) || (this.quality[yomoid] != quality)) {
                this.quality[yomoid] = quality;
                yomo_debug.debug("quality: " + this.quality[yomoid] + ", YoMo ID: " + yomoid);
            }
        },


    }
    //
    // END yomo video info object
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// thread-based sending module
// send information to java GUI via AJAX requests
//
var yomo_thread_based_sending = {
    worker: undefined,

    // Initialize the extension
    startup: function() {

        if (!yomo_settings.enable_gui) {
            dump("[YOMO FF extension] GUI is not enabled. Thread-based sending disabled.");
            return;
        }

        try {
            this.worker = new Worker("chrome://yomo-42/content/thread-based_sending_module-worker.js");
        } catch (e) {
            dump("[YOMO FF extension] Error while loading thread code: " + e);
        }

        // Small little dance to get 'this' to refer to yomo_thread-based_sending, not the
        // worker, when a message is received.
        var self = this;
        this.worker.onmessage = function(event) {
            self.onworkermessage.call(self, event);
        };


        this.worker.postMessage("");

    },

    // Clean up after ourselves and save the prefs
    shutdown: function() {
        if (!yomo_settings.enable_gui) return;
        // nothing to do at the moment
    },


    // Posts data to the sending thread
    sendData: function(data) {
        if (!yomo_settings.enable_gui) return;
        //yomo_debug.debug("data to thread: " + data);
        this.worker.postMessage(data);
    },

    // Called when the worker has updated data for the extension
    onworkermessage: function(event) {
        // received data from worker
        dump("[YOMO FF extension] got data from thread: " + event.data + "\n");
    }
};
//
// thread-based sending module END
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// settings module
//
var yomo_settings = {
    prefs: undefined,
    logRotateTimeout: 1000 * 60 * 60,
    userid: "default",
    filename_prefix: "yomo_output",
    filename_suffix: "log",
    debug_messages_to_log: false,
    dir: "##TEMP##",
    zip_log_files: false,
    use_external_parser: false,
    parser_type: 1, // type=1 mplayer, type=2 java yomo ver1
    parser_binary: "C:\\Program Files (x86)\\mplayer-bin\\mencoder.exe",
    do_not_delete_temp_flv_file: false,
    delete_old_log: true,
    print_header: true,
    delete_timeout: 1 * 60 * 60, // in seconds
    enable_gui: false,

	//which modules should be used
	inject_module: true,
	webpage_connection_module: true,
	filewriting_module: true,
	network_observer_module: true,
	HTTP_response_header_observer_module: true,
	threadbased_sending_module: true,
	


    init: function() {
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.yomo.");
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.getSettings();
        this.printSettings();
    },

    getSettings: function() {
        // prefs is an nsIPrefBranch
        if (this.prefs.prefHasUserValue("log_rotate_timeout")) {
            this.logRotateTimeout = this.prefs.getIntPref("log_rotate_timeout") * 1000; // config var in seconds
        }

        if (this.prefs.prefHasUserValue("userid")) {
            this.userid = this.prefs.getCharPref("userid");
        }

        if (this.prefs.prefHasUserValue("filename_suffix")) {
            this.filename_suffix = this.prefs.getCharPref("filename_suffix");
        }

        if (this.prefs.prefHasUserValue("filename_prefix")) {
            this.filename_prefix = this.prefs.getCharPref("filename_prefix");
        }

        if (this.prefs.prefHasUserValue("debug_messages_to_log")) {
            this.debug_messages_to_log = this.prefs.getBoolPref("debug_messages_to_log");
        }

        if (this.prefs.prefHasUserValue("log_directory")) {
            this.dir = this.prefs.getCharPref("log_directory");
        }

        if (this.prefs.prefHasUserValue("zip_log_files")) {
            this.zip_log_files = this.prefs.getBoolPref("zip_log_files");
        }

        if (this.prefs.prefHasUserValue("use_external_parser")) {
            this.use_external_parser = this.prefs.getBoolPref("use_external_parser");
        }

        if (this.prefs.prefHasUserValue("parser_type")) {
            this.parser_type = this.prefs.getIntPref("parser_type");
        }

        if (this.prefs.prefHasUserValue("delete_timeout")) {
            this.delete_timeout = this.prefs.getIntPref("delete_timeout");
        }

        if (this.prefs.prefHasUserValue("parser_binary")) {
            this.parser_binary = this.prefs.getCharPref("parser_binary");
        }

        if (this.prefs.prefHasUserValue("do_not_delete_temp_flv_file")) {
            this.do_not_delete_temp_flv_file = this.prefs.getBoolPref("do_not_delete_temp_flv_file");
        }

        if (this.prefs.prefHasUserValue("delete_old_log")) {
            this.delete_old_log = this.prefs.getBoolPref("delete_old_log");
        }
        if (this.prefs.prefHasUserValue("print_header_in_log_file")) {
            this.print_header = this.prefs.getBoolPref("print_header_in_log_file");
        }
        if (this.prefs.prefHasUserValue("enable_gui")) {
            this.enable_gui = this.prefs.getBoolPref("enable_gui");
        }
    },



    printSettings: function() {
        yomo_debug.debug("");
        yomo_debug.debug("+------------- Settings --------------+");
        yomo_debug.debug("Settings: log_rotate_timeout = " + this.logRotateTimeout);
        yomo_debug.debug("Settings: userid = " + this.userid);
        yomo_debug.debug("Settings: filename_prefix = " + this.filename_prefix);
        yomo_debug.debug("Settings: filename_suffix = " + this.filename_suffix);
        yomo_debug.debug("Settings: debug_messages_to_log = " + this.debug_messages_to_log);
        yomo_debug.debug("Settings: log_directory = " + this.dir);
        yomo_debug.debug("Settings: zip_log_files = " + this.zip_log_files);
        yomo_debug.debug("Settings: use_external_parser = " + this.use_external_parser);
        yomo_debug.debug("Settings: parser_type = " + this.parser_type);
        yomo_debug.debug("Settings: parser_binary = " + this.parser_binary);
        yomo_debug.debug("Settings: do_not_delete_temp_flv_file = " + this.do_not_delete_temp_flv_file);
        yomo_debug.debug("Settings: delete_old_log = " + this.delete_old_log);
        yomo_debug.debug("Settings: delete_timeout = " + this.delete_timeout);
        yomo_debug.debug("Settings: print_header_in_log_file = " + this.print_header);
		yomo_debug.debug("Settings: webpage_connection_module = " + this.webpage_connection_module);
		yomo_debug.debug("Settings: filewriting_module = " + this.filewriting_module);
		yomo_debug.debug("Settings: network_observer_module = " + this.network_observer_module);
		yomo_debug.debug("Settings: HTTP_response_header_observer_module = " + this.HTTP_response_header_observer_module);
		yomo_debug.debug("Settings: hreadbased_sending_module = " + this.hreadbased_sending_module);
        yomo_debug.debug("+-------------------------------------+");
        yomo_debug.debug("");
    }
};
//
// END settings
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// misc functions
//
function yomo_hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

function yomo_escape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function yomo_zip(fileToZip) {
    yomo_debug.debug("____ zipping file: " + fileToZip.path);
    try {
        var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
        var zipW = new zipWriter();

        var file = Components.classes["@mozilla.org/file/local;1"].
        createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileToZip.path + ".zip");
        file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        yomo_debug.debug("________ New file created for output: " + file.path);

        const PR_RDONLY = 0x01;
        const PR_WRONLY = 0x02;
        const PR_RDWR = 0x04;
        const PR_CREATE_FILE = 0x08;
        const PR_APPEND = 0x10;
        const PR_TRUNCATE = 0x20;
        const PR_SYNC = 0x40;
        const PR_EXCL = 0x80;
        zipW.open(file, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
        zipW.addEntryFile(fileToZip.leafName, Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, fileToZip, false);
        zipW.close();

        // delete file
        yomo_debug.debug("________  delete file: " + fileToZip);
        fileToZip.remove(false);


    } catch (e) {

        yomo_debug.debug("Error while zipping file: " + e);

    }
    yomo_debug.debug("____ Zipping done!");

};
//
// misc functions END
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// main
yomo_debug.debug("+=========================================+");
yomo_debug.debug("YoMo plugin version 4.2, Anika, HTML5");
yomo_debug.debug("+=========================================+");

// Settings
yomo_settings.init();
yomo_debug.debug("(1/7) settings module initialized.");
yomo_debug.debug("");


/// inject module
if(yomo_settings.inject_module){
	window.addEventListener("load", yomo_inject_ytreplay.onLoad, false);
	window.addEventListener("unload", yomo_inject_ytreplay.onUnload, false);
	yomo_debug.debug("(2/7) inject module initialized.");
	yomo_debug.debug("");
}

// webpage connection module
if(yomo_settings.webpage_connection_module){
	document.addEventListener("yomo_continuousInfos_event", yomo_webpage_connection.eventHandlerContinuousInfos, false, true);
	document.addEventListener("yomo_eventInfos_event", yomo_webpage_connection.eventHandlerEventInfos, false, true);
	yomo_debug.debug("(3/7) webpage connection module initialized.");
	yomo_debug.debug("");
}

// filewriting module
var yomo_filewriting_inject_module = undefined;
if(yomo_settings.filewriting_module){
	if(yomo_settings.debug_messages_to_log){
		var yomo_filewriting_debug = new yomo_writefile();
		yomo_filewriting_debug.init("debug");
	}
	if(yomo_settings.inject_module){
		var yomo_filewriting_webpage_continuous = new yomo_writefile();
		yomo_filewriting_webpage_continuous.init("webpageContinuous");
		var yomo_filewriting_webpage_event = new yomo_writefile();
		yomo_filewriting_webpage_event.init("webpageEvent");
	}
	if(yomo_settings.network_observer_module){
		var yomo_filewriting_network = new yomo_writefile();
		yomo_filewriting_network.init("network");
	}
	if(yomo_settings.HTTP_response_header_observer_module){
		var yomo_filewriting_response_header = new yomo_writefile();
		yomo_filewriting_response_header.init("responseHeader");
	}


	yomo_debug.debug("(4/7) file writing module initialized.");
	yomo_debug.debug("");
}


// network observer module
if(yomo_settings.network_observer_module){
	window.addEventListener("load", function(e) {
		yomo_network.init();
	}, false);
	window.addEventListener("unload", function(e) {
		yomo_network.close();
	}, false);
	yomo_debug.debug("(5/7) network observer module initialized.");
	yomo_debug.debug("");
}

// HTTP response header observer module
if(yomo_settings.HTTP_response_header_observer_module){
	window.addEventListener("load", function(e) {
		yomo_httpResponseObserver.init();
	}, false);
	window.addEventListener("unload", function(e) {
		yomo_httpResponseObserver.unregister();
	}, false);
	yomo_debug.debug("(6/7) HTTP response observer module initialized.");
	yomo_debug.debug("");
}

// thread-based sending module
if(yomo_settings.threadbased_sending_module){
	window.addEventListener("load", function(e) {
		yomo_thread_based_sending.startup();
	}, false);
	window.addEventListener("unload", function(e) {
		yomo_thread_based_sending.shutdown();
	}, false);
	yomo_debug.debug("(7/7) thread-based sending module initialized.");
	yomo_debug.debug("");
}

