//https://devdactic.com/complete-image-guide-ionic/
var app = angular.module('colegio_arquitectos.factory', []);


app.factory('Login', ['$http', function($http) {
  
  var dataFactory = {};

  dataFactory.getLogin = function (descripcion) {
    


    var d = {
      "email" : localStorage.getItem("email"),
      "codigo" : localStorage.getItem("codigo"),
    }

    var l = false;
    
    console.log(d);

    return $http({
        method: 'POST',
        url: 'http://www.librodeobra.com.ar/login.php',
        data: d,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function successCallback(response) {
          console.log(response);
          if(response.data.e == "0"){
            localStorage.setItem("reg",true);  
            localStorage.setItem("codigo",d.codigo);  
            localStorage.setItem("seed",response.data.seed);
            l = true;
          }else{
            console.log("_______ ERROR LOGIN________");
            localStorage.setItem("reg",false); 
          };

          return {
            "login": l,
            "descripcion": descripcion
          }

        });
    };

     return dataFactory;

}]);

app.factory('FileService', function() {
	var images;
	var IMAGE_STORAGE_KEY = 'fotos';

	function getImages() {
		var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);

		if (img) {
      try{
        images = JSON.parse(img);  
      }catch(err) {
          images = [];
      }
		  
		} else {
		  images = [];
		}
		return images;
	};

	function addImage(img) {
		images.push(img);
		window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
	};

	return {
		storeImage: addImage,
		images: getImages
	}
});

app.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      quality: 80,
      saveToPhotoAlbum: true,
      correctOrientation: true,
      targetHeight: 400,
      targetWidth: 400,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }

  function saveMedia(type) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);

      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        var newName = makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
  }
});
	
