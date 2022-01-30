(function() {
  var count = 0;
  var total_smile = 0;
  var width = 480;   
  var height = 0;   
  var check = true;

  var streaming = false;


  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var stopbutton = null;

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    stopbutton = document.getElementById('stopbutton');

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.log("An error occurred: " + err);
    });

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
      
      
        if (isNaN(height)) {
          height = width / (4/3);
        }
      
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
      check = false;

      var blinking = document.getElementById('borderCamera');
      blinking.setAttribute("style","background-color: red");
      var dot = document.getElementById('recordingDot');
      dot.className = "recordingDot Blink";


      takepicture();
      ev.preventDefault();
    }, false);
    
    stopbutton.addEventListener('click', function(ev){
      if (check == false) 
      {
        stoptaking();
        check = true;
        var blinking = document.getElementById('borderCamera');
        blinking.setAttribute("style","background-color: #ffffff");
        var dot = document.getElementById('recordingDot');
        dot.className = "recordingDot hidden";

      }
      ev.preventDefault();
    }, false);

    clearphoto();
  }


  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  

async function run(fileName){
  let data = {
    "requests":[
      {
        "image":{
          "content": fileName
        },
        "features":[
          {
            "type":"FACE_DETECTION",
            "maxResults": 10
          }
        ]
      }
    ]
  }
  let key = 'ya29.A0ARrdaM-5x5pWEH0Xd9LdEaBO3r_vvK0EjvSy2_d8-nojpAL1GWCowKTq6LkXJK3EXxn4DARBfIHjWG-zGZmczz5w68UiM2COLE8fkfSxnExMazOIsv2H72habfjqmCUhvbEIVy_ATENfSUR1Sa79jEy-tIwOQg';
  fetch(`https://vision.googleapis.com/v1/images:annotate`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json charset=utf-8',
          'Authorization': `Bearer ${key}`,
          'X-Goog-User-Project': "serene-bazaar-339719"
      },
      body: JSON.stringify(data),
  })
      .then(response => response.json())
      .then(response => {
          const faces = response.responses[0].faceAnnotations;
          console.log('hello', response.responses[0]);
          
          let cnt_joy = 0;

          for (let i = 0; i < faces.length; i++){
            if (faces[i].joyLikelihood.search("UNLIKELY") == -1) 
              cnt_joy++;


          };
          total_smile += cnt_joy;
      
          document.getElementById("joy").innerHTML = "Number of happy faces: " + cnt_joy;
          if (cnt_joy >= 2) 
            document.getElementById("spike").innerHTML = "YOU ARE DOING A GREAT JOB!!";
          else 
            document.getElementById("spike").innerHTML = "";
      });
}


  function taking(){
    var context = canvas.getContext('2d');
    
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      var data = canvas.toDataURL('image/png').split(';base64,')[1];
      photo.setAttribute('src', data);
      run(data);
    } else {
      clearphoto();
    }
  
  }

  let nIntervId;
  
  function takepicture() {
    

    if (!nIntervId) {

      nIntervId = setInterval(taking, 1000);
    }
  }

  function stoptaking(){
    clearInterval(nIntervId);
    nIntervId = null; 
    count++;
    var list = document.getElementById('myDropdown');
    let s = "";
    
    if (count == 1){
      var myobj = document.getElementById('placeholder');
      myobj.remove();
    }
    s += "Lecture  #" + count + " has " + total_smile + " smiles\n";
    var entry = document.createElement('a');
    var breakLine = document.createElement('hr');
    entry.appendChild(document.createTextNode(s));
    entry.href = 'lectureTemplate.html';
    list.appendChild(entry);
    list.appendChild(breakLine);
    total_smile = 0;
  }

  window.addEventListener('load', startup, false);
})();


function redirectNew(){
  
  location.href = 'lectureTemplate.html';
}
