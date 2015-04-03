/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    rows : 1,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
    },

    uploadFromCamera : function(){
        this.startUpload();
    },

    uploadFromGallery : function(){
        this.startUpload({sourceType: Camera.PictureSourceType.PHOTOLIBRARY});
    },

    startUpload : function(extraOptions){

        var options = {
            quality: 50,
            destinationType : Camera.DestinationType.FILE_URI,
            mediaType:  Camera.MediaType.ALLMEDIA
        };

        for (var key in extraOptions) {
            options[key] = extraOptions[key];
        }

        navigator.camera.getPicture(this.onUploadSuccess, this.onUploadError, options);
    },

    onUploadSuccess : function(imageURI){

        //hack to pick videos file as well for IOS
        imageURI = imageURI.replace('/private', '');

        console.log('new imageURI: '+imageURI);

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(){
            window.resolveLocalFileSystemURL(imageURI, app.gotFileEntry, app.onUploadError);
        }, function(){
            alert('Error requesting file system');
        });

    },

    gotFileEntry : function(fileEntry){

        fileEntry.file(function(file) {

            var reader = new FileReader();
            //handles error
            reader.onerror = function(evt) {
                 switch (evt.target.error.code) {
                    case evt.target.error.NOT_FOUND_ERR:
                      alert('File Not Found!');
                      break;
                    case evt.target.error.NOT_READABLE_ERR:
                      alert('File is not readable');
                      break;
                    case evt.target.error.ABORT_ERR:
                      break; // noop
                    default:
                      alert('An error occurred reading this file.');
                };

            };

            reader.onabort = function(e) {
                alert('Upload failed!');
            };

            reader.onloadend = function(evt) {
                var fileBody  = evt.target.result;
                var content_type = fileBody.substring(fileBody.indexOf('data:')+5, fileBody.indexOf(';')).trim();
                var body =  fileBody.substring(fileBody.indexOf('base64,')+7);
                var attachment = {
                  "body": body,
                  "name": file.name,
                  "content_type": content_type,
                  "size" : file.size
                };

                // Find a <table> element with id="myTable":
                var table = document.getElementById("files-table");

                // Create an empty <tr> element and add it to the 1st position of the table:
                var row = table.insertRow(app.rows);

                // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);

                // Add some text to the new cells:
                cell1.innerHTML = app.rows;
                cell2.innerHTML = attachment.name.length > 15 ? attachment.name.substring(0 ,  15) + '..' : attachment.name;
                cell3.innerHTML = attachment.content_type;
                cell4.innerHTML = (attachment.size/1000000).toFixed(1) + ' MB';

                //increment the row number
                app.rows++;

            };
             reader.readAsDataURL(file);

        }, this.onUploadError);
    },

    onUploadError : function(message){
        if(typeof message == 'object'){
            alert(JSON.stringify(message));
        }else{
            alert(message);
        }
    },
};

app.initialize();