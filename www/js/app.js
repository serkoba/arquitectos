(function(){
  var app = angular.module('colegio_arquitectos', ['ionic','wSQL','ngCordova','colegio_arquitectos.factory','colegio_arquitectos.config','pdf']);

  app.controller('LoginCtrl',function($scope,$location,$ionicNavBarDelegate,$state,$ionicPlatform, $cordovaDevice,$http,$ionicLoading,$ionicPopup,Login,wSQL){
    console.log("____LOGIN_____");
    $ionicNavBarDelegate.showBackButton(false);
    $scope.FormLoginValue = [];
    var reg = eval(window.localStorage.getItem("reg"));
    var datos_personales = eval(window.localStorage.getItem("datos_personales"));
    
    
    if(reg && datos_personales){
      // Datos Personales Fueron Guardados
        console.log("___BuscarDatosPersonales____");
        wSQL.select('*')
          .from("datos_personales")
          .where("id", 1)
          .row()
          .then(function(d){
            console.log(JSON.stringify(d));
            console.log(d.length);
            if(d[0]== null || d.length==0){
              $location.path('/login');
            }else{
              $location.path('/listado_caratulas');
            }     
          });
    }

    if(reg && !datos_personales){
      // Esta registrado pero no tiene datos personales inicados
      $location.path('/datos_personales');
    }

    if(datos_personales){
      $scope.FormLoginValue.email = window.localStorage.getItem("email");  
    }

    $scope.ProcesarLogin = function(){
      console.log("___ProcesarLogin___");

      $ionicLoading.show({
        content: 'Conectando',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });

      localStorage.setItem("codigo",$scope.FormLoginValue.codigo);  
      localStorage.setItem("email",$scope.FormLoginValue.email.toLowerCase());  
      

      Login.getLogin("Login 0")
        .then(function (response) {
            console.log(response);
            $ionicLoading.hide();
            /* REMOTE LOGIN */
            if(response.login){
              $location.path('/listado_caratulas');
            }
            
        }, function (error) {
            console.log(error);
        });
    }
  });

 app.controller('ListadoCaratulasCtrl',function($scope,$location,wSQL,$ionicNavBarDelegate,$state,$http,$ionicPopup,$ionicLoading){
    console.log("ListadoCaratulasCtrl");
    $ionicNavBarDelegate.showBackButton(false);
    $scope.shouldShowDelete = false;
    $scope.listCanSwipe = true
    $scope.caratulas = [];

    $scope.email = localStorage.getItem("email");
    $scope.codigo = localStorage.getItem("codigo");
    $scope.seed = localStorage.getItem("seed");

    var reg = eval(window.localStorage.getItem("reg"));

    if($scope.seed == null || $scope.codigo == null || $scope.email == null || !reg){
      localStorage.setItem("reg",false);  
      $location.path('/login');
    }

    var login = {
      "email" : $scope.email,
      "codigo" : $scope.codigo,
      "seed" : $scope.seed,
    }    

    

    $http({
        method: 'POST',
        url: 'http://www.librodeobra.com.ar/login.php',
        data: login,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function successCallback(response) {
          if(response.data.reg){
            localStorage.setItem("reg",true);  
            $scope.seed = response.data.seed;
            localStorage.setItem("seed",response.data.seed);
          }else{
            console.log("_______ ERROR LOGIN 1________");
            localStorage.setItem("reg",false); 
          };
        }, function errorCallback(response) {
          console.log(response);
        });

     wSQL.select("*")
        .from("caratulas")
        .query()
        .then(function(d){

          for (var i = d.length - 1; i >= 0; i--) {
            $scope.caratulas.push(d[i]);
          }

            var datos = {
              "email":$scope.email,
              "codigo":$scope.codigo,
              "seed":$scope.seed,
              "caratulas": d
            }

            $http({
              method: 'POST',
              url: 'http://www.librodeobra.com.ar/actualizar_caratulas.php',
              data: datos,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function successCallback(response) {
              
              //console.log("____RESPUESTA DE ListadoCaratulasCtrl ___");
              //console.log(JSON.stringify(response));

              if(response.data.e=="1"){
                console.log("_______ ERROR LOGIN 5________");
                localStorage.setItem("reg",false);  
                $location.path('/login');

              }
            }, function errorCallback(response) {
              console.log(response);
            });

        });

     wSQL.select()
          .from("actas_inicio_obra")
          .query()
          .then(function(d){
             var datos = {
              "email":$scope.email,
              "codigo":$scope.codigo,
              "seed":$scope.seed,
              "actas": d
            }

            $http({
              method: 'POST',
              url: 'http://www.librodeobra.com.ar/actualizar_aca_inicio_obra.php',
              data: datos,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function successCallback(response) {
              $ionicLoading.hide();
              if(response.data.e=="1"){
                console.log("_______ ERROR LOGIN 6________");
                localStorage.setItem("reg",false);  
                $location.path('/login');
              }
              
            }, function errorCallback(response) {
              console.log(response);
            });

          });


   $scope.Sincronizar  = function(fuente){

      $ionicLoading.show({
        content: 'Sincronizando',
        animation: 'fade-in',
        showDelay: 0
      });

      $scope.email = localStorage.getItem("email");
      $scope.codigo = localStorage.getItem("codigo");
      $scope.seed = localStorage.getItem("seed");

      var login = {
        "email" : $scope.email,
        "codigo" : $scope.codigo,
        "seed" : $scope.seed,
      }

     // GET CARATULAS NUEVAS
      $http({
        method: 'POST',
        data: login,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: 'http://www.librodeobra.com.ar/get_caratulas.php',
      }).then(function successCallback(response) {

          if(response.data.e=="0"){
            var caratulas_nuevas = [];
            for (var i = response.data.caratulas.length - 1; i >= 0; i--) {
              caratulas_nuevas.push({
                "direccion_obra":response.data.caratulas[i].direccion,
                "duracion":response.data.caratulas[i].duracion,
                "expdiente_capba":response.data.caratulas[i].exp_capba,
                "expediente_municipal":response.data.caratulas[i].exp_municipal,
                "id":response.data.caratulas[i].id_caratula,
                "localidad_obra":response.data.caratulas[i].localidad_obra,
                "municipalidad_obra":response.data.caratulas[i].municipalidad,
                "pdf":response.data.caratulas[i].pdf,
                "superficie":response.data.caratulas[i].sup_cubierta,
                "superficie_semi":response.data.caratulas[i].sub_semi,
                "tarea":response.data.caratulas[i].tipo_profesional,

              })
            }

            wSQL.batch_insert_on_duplicate_key_update("caratulas",caratulas_nuevas,["id"])
              .then(function(result){
                  console.log("result bach");
                  $state.reload();
              });

          }else{
            console.log("ERROR LOGIN");
            localStorage.setItem("reg",false);  
            $location.path('/login');

          }

        }, function errorCallback(response) {
          console.log("errorCallback");
          console.log(response);
            wSQL.select("*")
              .from("datos_personales")
              .query()
              .then(function(d){
                if(d.length>0){
                  $scope.FormDatosPersonalesValue = d[0];
                }
              });
        });

      // GET ORDENES
      $http({
        method: 'POST',
        data: login,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: 'http://www.librodeobra.com.ar/get_ordenes_de_servicio.php',
      }).then(function successCallback(response) {
          
          if(response.data.e=="0"){
            var ordenes_servidor = response.data.ordenes;

            for (var j = ordenes_servidor.length - 1; j >= 0; j--) {

                var f = ordenes_servidor[j].fecha.split("-");
                var fecha = new Date(f[0], f[1] - 1, f[2]);

                var t = 'SELECT fotos FROM ordenes_de_servicios WHERE id = '+ordenes_servidor[j].id_orden_servicio;
                $scope.InsertarOrden(t,[ordenes_servidor[j],fecha,j]);
              }
            }

            

        }, function errorCallback(response) {
          console.log("errorCallback");
          console.log(response);
        });

       // GET ACTAS
      $http({
        method: 'POST',
        data: login,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: 'http://www.librodeobra.com.ar/get_actas.php',
      }).then(function successCallback(response) {
          console.log(response); 
          if(response.data.e=="0"){
            var actas_nuevas = [];
            for (var i = response.data.actas.length - 1; i >= 0; i--) {
              var f = new Date(response.data.actas[i].fecha).toString();
              actas_nuevas.push({
                "fecha":f,
                "obra":response.data.actas[i].obra,
                "ubicacion":response.data.actas[i].ubicacion,
                "CIRC":response.data.actas[i].circ,
                "SECC":response.data.actas[i].secc,
                "MZ":response.data.actas[i].mz,
                "parcela":response.data.actas[i].parcela,
                "partida":response.data.actas[i].partida,
                "expediente":response.data.actas[i].expediente,
                "contratista":response.data.actas[i].contratista,
                "director":response.data.actas[i].director,
                "id":response.data.actas[i].id_caratula,

              })
            }

            wSQL.batch_insert_on_duplicate_key_update("actas_inicio_obra",actas_nuevas,["id"])
              .then(function(result){
                  console.log("result bach");
              });

          }else{
            console.log("ERROR LOGIN");
            localStorage.setItem("reg",false);  
            $location.path('/login');

          }

        }, function errorCallback(response) {
          console.log("errorCallback");
          console.log(response);
            wSQL.select("*")
              .from("datos_personales")
              .query()
              .then(function(d){
                if(d.length>0){
                  $scope.FormDatosPersonalesValue = d[0];
                }
              });
        });

    }
    
    $scope.InsertarOrden = function(t,p){
      wSQL.query(t,[],p)
         .then(function(result){

            var fotos;

            if(result.length==0){
              fotos = " ";
            }else{
              fotos = result[0].fotos;
            }

            fotos = "\""+fotos+"\"";

            var q = 'INSERT OR REPLACE INTO ordenes_de_servicios VALUES ('+p[0].id+', "'+p[0].estado+'",1,'+p[0].id_caratula+',"'+p[1]+'","'+p[0].descripcion+'",'+fotos+')';

            wSQL.query(q)
           .then(function(result,error){
                console.log(result);
            }, function(error){
                console.log(error);
            });

          }, function(error){
              console.log(error);
          });

    }

    //END SINCRONIZAR

    $scope.logout = function(){
      localStorage.setItem("reg",false);  
      $location.path('/login');
    }

    $scope.Entero = function(numero){
          return parseInt(numero);
    }

    $scope.changeView = function(id){
       $location.path('/listado_ordenes_servicios/'+id);
    }
    $scope.edit = function(id){
       $location.path('/caratula/'+id);
    }
    $scope.borrar = function(){
      // Al borrar caratula deberia borrarse todo en casacada
    }
  });

  app.controller('DatosPersonalesCtrl',function($scope,$location,wSQL,$ionicNavBarDelegate,$http,$ionicLoading){
    
    $ionicLoading.show({
        content: 'Conectando',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });

    $ionicNavBarDelegate.showBackButton(false);
    $scope.FormDatosPersonalesValue = [];

    var datos = {
      email:localStorage.getItem("email"),
      codigo:localStorage.getItem("codigo"),
      seed:localStorage.getItem("seed"),
    }

    $http({
      method: 'POST',
      data: datos,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      url: 'http://www.librodeobra.com.ar/get_datos_personales.php',
    }).then(function successCallback(response) {
        $ionicLoading.hide();

        if(response.data.e=="0"){
          var data = response.data.mensaje;
          $scope.FormDatosPersonalesValue.profesional = data.profesional_actuante;
          $scope.FormDatosPersonalesValue.matricula = parseInt(data.matricula);
          $scope.FormDatosPersonalesValue.altura = data.altura;
          $scope.FormDatosPersonalesValue.calle = data.calle;
          $scope.FormDatosPersonalesValue.codigo = data.codigo;
          $scope.FormDatosPersonalesValue.departamento = data.departamento;
          $scope.FormDatosPersonalesValue.localidad = data.localidad;
          $scope.FormDatosPersonalesValue.email = data.email;
          $scope.FormDatosPersonalesValue.telefono = data.telefono;

        }else{
          console.log("ERROR LOGIN");
          localStorage.setItem("reg",false); 
          $location.path('/login');
        }

      }, function errorCallback(response) {
        console.log("errorCallback");
        console.log(response);
          wSQL.select("*")
            .from("datos_personales")
            .query()
            .then(function(d){
              if(d.length>0){
                $scope.FormDatosPersonalesValue = d[0];
              }
            });
      });


    $scope.ProcesarDatosPersonales = function() {
      $scope.FormDatosPersonalesValue["id"] = 1;
      $scope.FormDatosPersonalesValue.matricula = parseInt($scope.FormDatosPersonalesValue.matricula);
      $scope.FormDatosPersonalesValue.altura = parseInt($scope.FormDatosPersonalesValue.altura);
      delete $scope.FormDatosPersonalesValue['codigo'];

      wSQL.select('*')
          .from("datos_personales")
          .query()
          .then(function(d){
              window.localStorage.setItem("datos_personales",true);
              if(d.length>0){
                wSQL.update("datos_personales", $scope.FormDatosPersonalesValue)
                 .where("id", 1)
                  .query()
                  .then(function(result){
                      $location.path('/listado_caratulas');
                  })

              }else{
                wSQL.insert("datos_personales", $scope.FormDatosPersonalesValue)
                  .then(function(insert){
                    if(insert !== null && typeof insert === 'object'){
                      $location.path('/listado_caratulas');
                    }
                  });
              }


              var datos = {
                email:localStorage.getItem("email"),
                codigo:localStorage.getItem("codigo"),
                seed:localStorage.getItem("seed"),
                altura:$scope.FormDatosPersonalesValue.altura,
                calle:$scope.FormDatosPersonalesValue.calle,
                codigo:$scope.FormDatosPersonalesValue.codigo,
                departamento:$scope.FormDatosPersonalesValue.departamento,
                localidad:$scope.FormDatosPersonalesValue.localidad,
                matricula:$scope.FormDatosPersonalesValue.matricula,
                profesional:$scope.FormDatosPersonalesValue.profesional,
                telefono:$scope.FormDatosPersonalesValue.telefono
              }
              

              $http({
                method: 'POST',
                url: 'http://www.librodeobra.com.ar/datos_personales.php',
                data: datos,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              }).then(function successCallback(response) {
                  //console.log("____RESPUESTA DE DatosPersonalesCtrl ___");
                  //console.log(JSON.stringify(response));
                  if(response.data.e=="1"){
                    console.log("_____ ERROR LOGIN 2_____");
                    console.log(JSON.stringify(response));
                    localStorage.setItem("reg",false);  
                    $location.path('/login');
                  }
                }, function errorCallback(response) {
                  console.log(response);
                });

          });
      }
  });

  app.controller('CaratulaCtrl',function($scope,$state,wSQL,$ionicNavBarDelegate,$location){
      $ionicNavBarDelegate.showBackButton(true);
      $scope.id = $state.params.id;
      $scope.FormCaratulaValues = [];
      $scope.FormTarea = [];

      if($scope.id > 0){
        wSQL.select()
          .from("caratulas")
          .where("id", $scope.id)
          .row()
          .then(function(d){
              d[0].matricula = parseInt(d[0].matricula);
              $scope.FormCaratulaValues = d[0];
              
              $scope.FormCaratulaValues.municipalidad_obra = parseInt($scope.FormCaratulaValues.municipalidad_obra);
              $scope.FormCaratulaValues.expediente_municipal = parseInt($scope.FormCaratulaValues.expediente_municipal);
              $scope.FormCaratulaValues.superficie = parseInt($scope.FormCaratulaValues.superficie);
              $scope.FormCaratulaValues.superficie_semi = parseInt($scope.FormCaratulaValues.superficie_semi);
              
              var campos = $scope.FormCaratulaValues.tarea.toString();
              
              var n = campos.toString().length;
              if(n==3){
                $scope.FormTarea["proyecto"] = false;
                $scope.FormTarea["direccion_tarea"]= (campos[1]=="1");
                $scope.FormTarea["direccion_ejecutiva"]= (campos[2]=="1");
                $scope.FormTarea["representacion_tecnica"]= (campos[3]=="1");
              }else{

                $scope.FormTarea["proyecto"] = (campos[0]=="1");
                $scope.FormTarea["direccion_tarea"]= (campos[1]=="1");
                $scope.FormTarea["direccion_ejecutiva"]= (campos[2]=="1");
                $scope.FormTarea["representacion_tecnica"]= (campos[3]=="1");
              }
              
              
          });
      }

      $scope.ProcesarCaratula = function() {
        console.log("ProcesarCaratula");
        
        var proyecto = $scope.FormTarea.proyecto;
        var direccion_tarea = $scope.FormTarea.direccion_tarea;
        var direccion_ejecutiva = $scope.FormTarea.direccion_ejecutiva;
        var representacion_tecnica = $scope.FormTarea.representacion_tecnica;

        (proyecto)?proyecto="1":proyecto="0";
        (direccion_tarea)?direccion_tarea="1":direccion_tarea="0";
        (direccion_ejecutiva)?direccion_ejecutiva="1":direccion_ejecutiva="0";
        (representacion_tecnica)?representacion_tecnica="1":representacion_tecnica="0";
        
        $scope.FormCaratulaValues['tarea'] = parseInt(proyecto+direccion_tarea+direccion_ejecutiva+representacion_tecnica);

        // Si tarea tiene 3 dijitos es porque proyecto es 0/false/desmarcado.
        console.log(  $scope.FormCaratulaValues['tarea'] );
        console.log($scope.FormCaratulaValues);
        if($scope.id > 0){
          wSQL.update("caratulas", $scope.FormCaratulaValues)
             .where("id", $scope.id)
              .query()
              .then(function(result){
                  $location.path('/acta_inicio_obra/'+$scope.id);
              })
        }else{
          wSQL.insert("caratulas", $scope.FormCaratulaValues)
            .then(function(insert){
              if(insert !== null && typeof insert === 'object'){
                $location.path('/acta_inicio_obra/'+insert.insertId);
              }
            });
          }
      }

  });

  app.controller('ActaInicioObraCtrl',function($scope,$state,wSQL,$ionicNavBarDelegate,$location){
      $ionicNavBarDelegate.showBackButton(true);
      $scope.id = parseInt($state.params.id_caratula);
      $scope.FormValues = {};
      $scope.exist = false;

      wSQL.select()
          .from("actas_inicio_obra")
          .where("id", $scope.id)
          .row()
          .then(function(d){
            if(d.length>0){
              $scope.FormValues = d[0];
              $scope.exist = true;
              $scope.FormValues.fecha2 = new Date($scope.FormValues.fecha);
            }else{
              $scope.FormValues.fecha2 = new Date();
            }
          });

      $scope.ProcesarInicioObra = function() {
        $scope.FormValues.id = parseInt($scope.id);
        $scope.FormValues.fecha = $scope.FormValues.fecha2.toString();
        delete $scope.FormValues.fecha2;
        if($scope.exist){
          wSQL.update("actas_inicio_obra", $scope.FormValues)
             .where("id", $scope.id)
              .query()
              .then(function(result){
                  $location.path('/listado_ordenes_servicios/'+$scope.id);
              })
        }else{
          wSQL.insert("actas_inicio_obra", $scope.FormValues)
            .then(function(insert){
              if(insert !== null && typeof insert === 'object'){
                $location.path('/listado_ordenes_servicios/'+insert.insertId);
              }
            });
          }
      }
  });

  app.controller('ListadoOrdenesServiciosCtrl',function($scope,$state,wSQL,$ionicNavBarDelegate,$location,$cordovaFile,$cordovaDevice,$ionicPopup,$timeout,$window,$http){
    
    $scope.email = localStorage.getItem("email");
    $scope.codigo = localStorage.getItem("codigo");
    $scope.seed = localStorage.getItem("seed");

    if($scope.seed == null || $scope.codigo == null || $scope.email == null){
      console.log("_______ ERROR LOGIN 3________");
      localStorage.setItem("reg",false);  
      $location.path('/login');

    }

    var carpeta_pdf = cordova.file.externalDataDirectory;
    $window.resolveLocalFileSystemURL(
        carpeta_pdf,
        function (dirEntry) {
            var dirReader = dirEntry.createReader();

            dirReader.readEntries(
                function (entries) {
                    console.log(JSON.stringify(entries));// directory entries
                    for (var i = entries.length - 1; i >= 0; i--) {
                      if(entries[i].isFile){
                        $cordovaFile.removeFile(carpeta_pdf, entries[i].name).then(function(success){
                          console.log("__BORRADO PDF___");
                        },function(error){
                          console.log("__ERROR BORRANDO PDF");
                        });
                      }
                    }
                },
                function (err) {
                    console.log(err);
                }
            );

        },
        function (err) {
            console.log(err);
        }
    );
    $ionicNavBarDelegate.showBackButton(true);
    $scope.shouldShowDelete = false;
    $scope.listCanSwipe = true
    $scope.id_caratula = parseInt($state.params.id_caratula);

    if(isNaN($scope.id_caratula) || $scope.id_caratula == 0 || $scope.id_caratula == "0"){
      $location.path('/listado_caratulas/');
    }
    $scope.data = {};
    $scope.FormValues = {};
    $scope.exist = false;
    $scope.ordenes_de_servicios = [];

    wSQL.select()
          .from("caratulas")
          .where("id", $scope.id_caratula)
          .query()
          .then(function(d){
                if(d.length==0){ // Caratula que no existe
                   $location.path('/listado_caratulas/');
                }else{
                  $scope.data.pdf = d[0].pdf;
                }
          });

    wSQL.select()
          .from("ordenes_de_servicios")
          .where("id_caratula", $scope.id_caratula)
          .order_by('id')
          .query()
          .then(function(d){
            
            $scope.ordenes_de_servicios = d;


            var datos = {
              "email":$scope.email,
              "codigo":$scope.codigo,
              "seed":$scope.seed,
              "caratula":$scope.id_caratula,
              "ordenes": d
            }

            console.log("___DATOS____");
            console.log(JSON.stringify(datos));

            $http({
              method: 'POST',
              url: 'http://www.librodeobra.com.ar/actualizar_ordenes_de_servicio.php',
              data: datos,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function successCallback(response) {
              console.log("____RESPUESTA DE ListadoOrdenesServiciosCtrl ___");
              console.log(JSON.stringify(response));
              if(response.data.e=="1"){
                console.log("_______ ERROR LOGIN 4________");
                localStorage.setItem("reg",false);  
                $location.path('/login');
              }
            }, function errorCallback(response) {
              console.log(response);
            });

          });

    $scope.changeView = function(id){
       $location.path('/orden_servicio/'+$scope.id_caratula+'/'+id);
    }

    $scope.borrar = function(id){

      /*wSQL.select()
          .from("ordenes_de_servicios")
          .where("id", id)
          .row()
          .then(function(d){
            if(d.length>0){
              var fotos;
              try {
                  fotos = JSON.parse(d[0].fotos);
                  for (var i = fotos.length - 1; i >= 0; i--) {
                     $cordovaFile.removeFile(cordova.file.dataDirectory, fotos[i])
                      .then(function (result) {
                        console.log('Success:' + JSON.stringify(result));
                      }, function (err) {
                        console.log('Error: ' + JSON.stringify(err));
                      });
                  }
              }
              catch(err) {
                console.log("___ ERROR JSON.Parse_____");
                console.log(d[0].fotos);
              }
              wSQL.delete("ordenes_de_servicios")
                .where("id", id)
                .query()
                .then(function(data){
                    $state.reload();
                });
            }
          });*/
          wSQL.select()
            .from("ordenes_de_servicios")
            .where("id", id)
            .row()
            .then(function(d){
              wSQL.update("ordenes_de_servicios", {estado: !eval(d[0].estado)})
                .where("id", id)
                .query()
                .then(function(data){
                    console.log("___Anulada___");
                    $state.reload();
              });
            });
    }

    $scope.showPopup = function() {

      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.pdf">',
        title: 'Actualizar nombre del PDF',
        scope: $scope,
        buttons: [
          { text: 'Cancelar' },
          {
            text: '<b>Guardar</b>',
            type: 'button-positive',
            onTap: function(e) {
              console.log($scope.data.pdf);
              if (!$scope.data.pdf) {
                e.preventDefault();
              } else {
                var substring = ".pdf";
                if($scope.data.pdf.indexOf(substring) !== -1){
                  $scope.data.pdf = $scope.data.pdf.slice(0, -4); // elimino la extension .pdf
                }
                $scope.data.pdf = $scope.data.pdf.replace(/[^\w\s]/gi, '').replace(/ /g, '_');
                $scope.data.pdf = ValidarNombrePDF($scope.data.pdf);
                console.log("____ VALIDAR NOMBRE POPUP_____");
                console.log($scope.data.pdf);
                return $scope.data.pdf;
              }
            }
          }
        ]
      });

      myPopup.then(function(nombre) {
        nombre = ValidarNombrePDF(nombre);
        wSQL.update("caratulas", {pdf: nombre})
          .where("id", $scope.id_caratula)
          .query()
          .then(function(result){
              console.log("___Actualizadada la URL en la DB___");
          });
      });

     };

     function ValidarNombrePDF(nombre){
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(nombre)[1];

      if (nombre === undefined || nombre === null) {
          return  "Libro_de_obra.pdf";
      }

      if( nombre != ""){
        if(ext=="pdf"){
          return nombre;
        }else{
          return nombre+".pdf";
        }
      }
      return "Libro_de_obra.pdf";
    }

  });

  app.controller('PDFCtrl',function($scope,wSQL,$location,$state,$cordovaFile,$ionicPlatform,$cordovaDevice,$cordovaFileOpener2,$cordovaSocialSharing,$ionicLoading){
    console.log("___PDFCtrl____");
    $scope.id_caratula = parseInt($state.params.id_caratula);
    var carpeta_pdf = cordova.file.externalDataDirectory;
    var carpeta_imagenes = cordova.file.dataDirectory;
    var archivo_pdf = $scope.id_caratula+".pdf";
    var ordenes = [];
    var datos_personales;
    $scope.scroll = 3;
    var caratula,libro,nombre_pdf;
    var numero_ordenes_de_servicios;
    var numero_ordenes_de_servicios_procesadas = 0;

    $ionicLoading.show({
        template: '<p>Generando PDF</p><p>Puede demorar algunos segundos.</p>',
      }).then(function(){
         console.log("The loading indicator is now displayed");
      });

    $scope.pageLoaded = function(curPage, totalPages) {
        $scope.currentPage = curPage;
        $scope.totalPages = totalPages;
    };

    wSQL.select()
          .from("actas_inicio_obra")
          .where("id", $scope.id_caratula)
          .row()
          .then(function(d){
            libro = d[0];
            libro.fecha = new Date(libro.fecha);
            libro_init = true;
            BuscarDatosPersonales();
          });

    function BuscarDatosPersonales(){
      console.log("___BuscarDatosPersonales____");
      wSQL.select('*')
          .from("datos_personales")
          .where("id", 1)
          .row()
          .then(function(d){
            console.log(JSON.stringify(d));
            datos_personales = d[0];
            BuscarLibro();
          });
    }

    function BuscarLibro(){
      console.log("___BuscarLibro____");
      wSQL.select()
          .from("caratulas")
          .where("id", $scope.id_caratula)
          .row()
          .then(function(d){
            caratula = d[0];
            caratula_init = true;
            $scope.nombrePDF = d[0].pdf;
            nombre_pdf = d[0].pdf;
            nombre_pdf = ValidarNombrePDF(nombre_pdf);
            BuscarOrdenesServicios();
          })
    }

    function BuscarOrdenesServicios(){
      console.log("___BuscarOrdenesSercicios____");
      wSQL.select()
          .from("ordenes_de_servicios")
          .where("id_caratula", $scope.id_caratula)
          .and("estado", 'true')
          .query()
          .then(function(d){
            console.log("____ ORDENES ESTADO______");
            numero_ordenes_de_servicios = d.length;
            for (var i = 0; i<d.length; i++) {

                var set_fotos = [];
                var fotos;

                try {
                    fotos = JSON.parse(d[i].fotos);
                  } catch (e) {
                    fotos = [];
                    console.log("Foto vacia");
                  }

                console.log("Cantidad de fotos: ",fotos.length);
                if(fotos.length>0){
                  /* Hay fotos */
                  for (var j = fotos.length - 1; j >= 0; j--) {
                    
                    var archivo = carpeta_imagenes+fotos[j];

                    getDataUri(archivo,d[i],j,i, fotos.length ,function(dataUri,d,j,i,j_max,archivo) {

                      set_fotos.push({
                        image: dataUri
                      });
                      
                      if(set_fotos.length==j_max){
                        var set_fotos_temp = set_fotos;
                        set_fotos = [];
                        /* Adjunte las fotos a la Orden de Servicio y paso a preparar*/
                        AdjuntarFotos(d,set_fotos_temp,i,j,j_max);
                      }
                    });
                  } 
                }else{
                  /* No hay fotos :) */
                  console.log("__ NO HAY FOTOS ___");
                  var fecha = new Date(d[i].fecha);
                  var contenido = [
                    {
                      table: {
                          widths: [ '*', '*' ],
                          body: [
                              [
                                { rowSpan: 3, 
                                  image: 'data:image/jpeg;base64,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UUUUAYv9099v9TRRRQB//9n/4Qo8aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjFFRUVBMzJCNDQ5QUU2MTE4RUZBRjlGMUFBN0I5QzExPC94bXBNTTpJbnN0YW5jZUlEPgogIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+NzI4NTUyNjRDMkFEOUFEN0IxN0I2Njk1MEJCRTRENTI8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICA8eG1wTU06RG9jdW1lbnRJRCByZGY6cmVzb3VyY2U9JzcyODU1MjY0QzJBRDlBRDdCMTdCNjY5NTBCQkU0RDUyJyAvPgogIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MUVFRUEzMkI0NDlBRTYxMThFRkFGOUYxQUE3QjlDMTE8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD43Mjg1NTI2NEMyQUQ5QUQ3QjE3QjY2OTUwQkJFNEQ1MjwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogIDx4bXBNTTpIaXN0b3J5PgogICA8cmRmOlNlcT4KICAgPC9yZGY6U2VxPgogIDwveG1wTU06SGlzdG9yeT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6cGhvdG9zaG9wPSdodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvJz4KICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCIElFQzYxOTY2LTIuMTwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTEwLTI0VDE5OjU1OjU5LTAzOjAwPC94bXA6Q3JlYXRlRGF0ZT4KICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1vZGlmeURhdGU+CiAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1ldGFkYXRhRGF0ZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZXhpZj0naHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8nPgogIDxleGlmOkltYWdlV2lkdGg+MTE5MTwvZXhpZjpJbWFnZVdpZHRoPgogIDxleGlmOkltYWdlTGVuZ3RoPjQwNjwvZXhpZjpJbWFnZUxlbmd0aD4KICA8ZXhpZjpCaXRzUGVyU2FtcGxlPjgsIDgsIDg8L2V4aWY6Qml0c1BlclNhbXBsZT4KICA8ZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPlJWQTwvZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogIDxleGlmOk9yaWVudGF0aW9uPlN1cGVyaW9yIGl6cXVpZXJkYTwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpTYW1wbGVzUGVyUGl4ZWw+MzwvZXhpZjpTYW1wbGVzUGVyUGl4ZWw+CiAgPGV4aWY6WFJlc29sdXRpb24+NzIsMDAwMDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MiwwMDAwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PlB1bGdhZGFzPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpPC9leGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMTY6MTA6MjQgMjA6NDc6MDY8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6Q29tcHJlc3Npb24+Q29tcHJlc2nDs24gSlBFRzwvZXhpZjpDb21wcmVzc2lvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MjwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5QdWxnYWRhczwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5WZXJzacOzbiBFeGlmIDIuMjE8L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPkZsYXNoUGl4IFZlcnNpb24gMS4wPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICA8ZXhpZjpDb2xvclNwYWNlPnNSR0I8L2V4aWY6Q29sb3JTcGFjZT4KICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NTAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTcwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/Pgr/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNG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',width:200 }, 
                                   ""],
                              [ '', {text:'LIBRO 1',style:['fecha'],margin: [ 150, 30, 0, 0]}],
                              [ '', {text:'Fecha '+fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear(),style:['fecha'],margin: [ 150, 0, 0, 0]} ],
                          ]
                      },
                      layout: 'noBorders',
                    },
                    { text: 'ACTA DE OBRA N° ' + d[i].n_orden, style: ['header_obra']},
                    { text: 'OBRA: '+ libro.obra, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
                    { text: 'CONTRATISTA / CONSTRUCTOR O REPRESENTANTE TÉCNICO: '+libro.contratista, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
                    { text: 'DESCRIPCIÓN: ' + d[i].descripcion, style: ['parrafo'],margin: [ 20, 40, 20, 0 ]},
                    /* */
                    /* */
                  ];
                  contenido.push({ text: '', pageBreak: 'after'});
                  console.log("___ PUSH ORDEN SIN FOTO____");
                  ordenes.push(contenido);
                  numero_ordenes_de_servicios_procesadas++;
                  ControlarOrdenesProcesadas();
                }

                
            }
          })

    }

    function ControlarOrdenesProcesadas(){
      // Termine de adjuntar todo sigo.
      if(numero_ordenes_de_servicios == numero_ordenes_de_servicios_procesadas){
        console.log("___Termine de adjuntar todo sigo.___");
        OrdenarOrdenes();
      }
    }

    function AdjuntarFotos(d,set_fotos,i,j,j_max){
      // d es la orden de servicio
      // d_f es el total de 
      // Adjunto las fotos a la OS
      console.log("_______AdjuntarFotos_____");
      var fecha = new Date(d.fecha);
      var contenido = [
          {
            table: {
                widths: [ '*', '*' ],
                body: [
                    [
                      { rowSpan: 3, 
                        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QcDRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAMAAAAcgEyAAIAAAAUAAAAfodpAAQAAAABAAAAkgAAANQAAABIAAAAAQAAAEgAAAABR0lNUCAyLjguMTAAMjAxNjoxMDoyNCAyMDo0OTo0MwAABZAAAAcAAAAEMDIyMaAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAABLKADAAQAAAABAAAAZgAAAAAABgEDAAMAAAABAAYAAAEaAAUAAAABAAABIgEbAAUAAAABAAABKgEoAAMAAAABAAIAAAIBAAQAAAABAAABMgICAAQAAAABAAAFyQAAAAAAAABIAAAAAQAAAEgAAAAB/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAsHCAoIBwsKCQoMDAsNEBsSEA8PECEYGRQbJyMpKScjJiUsMT81LC47LyUmNko3O0FDRkdGKjRNUkxEUj9FRkP/2wBDAQwMDBAOECASEiBDLSYtQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0P/wAARCAAiAGYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD1yvOPiJ4++y+ZpWjS/v8AlZ7hT9z1VT6+p7fXofErxzJZyS6NpbMk4GLiccFQRnavvg9f8jz6HTb2CJJo7O4lmkUMjLEzKgPIOccn+X16AHZeBPG50ZY9M1yd2jdh5btybcejH09u36D1VGV1DIQysMgg5BFfPC6NKUInZorpuVjdcf8AfR7E/wD667T4e+I9V0iRNM1SyvXsSdqSeQ5MB/L7v8qbi1uTGcZNpPY9UooopFBRRRQAUUUUAFFFFABRRRQBxPxA8FJrcbXloFS+UdegkHof6GuK8HeJ38PXx07WY3+yBtrBh80B/wAPb8R7+1kZGDXF+PPBMWtwm5tAsd6g+Vuzj0P+NAGydC06/uINQjWOTC5jkU5BB6H39qLi6htbmSOO2DeU8cW4ybcu+NvGOnIyf0NZfw00jUtH0l4dRlbDNuSAkEReoz7+g4/WtbVp3jkuGGli5dV2p+5LmQYz1xjGeMfjjFUn3Icf5dBqeIQ0EjLbHzI5hCV3kgtkqSMAkjKntTZPE8cYBa34diEAfngNycjA5THU474qp9pmmliddFikgMZUgQE5+ZcLkr2G456Hp2qeWW7Nus1vpEXnSCTejwYLEMqrn0ypc807x7E8tTuXW1hxCD9nXzftDQMvm4UEKWJDY6YHp1plnr8d1YXN6YWjghXI3E5bjp0x+RNLKzIhh/syOW1jwUATAzgHIXB7k/ketHnsjuy6QRv5c7RkkHgnAOeefpyPSlePYdp33Kp8VxZj225YOgOQ/AclhjOMYBUjOffGM1LJ4kWKO6Mlv+8tmVWVZMhiWYcHHIG2pnmLRTH+y8uGA+aPh8g89Pcj8e3NRL5cS2skejKqyBzIoiGYuMenf0707x7C5ancT+35BNsa0AHm7MrIzfwB84C+jD8c896WbXpYbeGd7RDFLGZBtnyQAAf7uM4I70Pdu8bO+iMdkg2hlBJOOGHHoOv0/CVpTFFH5OlYVjJvUIBt7Djvu4/Ci8ew+WfcrzeJVtpHS6hSERtsaRpTsLdcBgvPB74/HBwUrXHkn5dCPyBVXYg6EZIGB2PX3oovHsLlqdzcoNFFQagBjpRRRQAUUUUAFFFFABRRRQAVn6sSJbXBIzJ/UUUUAYv9099v9TRRRQB//9n/4Qo8aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjFFRUVBMzJCNDQ5QUU2MTE4RUZBRjlGMUFBN0I5QzExPC94bXBNTTpJbnN0YW5jZUlEPgogIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+NzI4NTUyNjRDMkFEOUFEN0IxN0I2Njk1MEJCRTRENTI8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICA8eG1wTU06RG9jdW1lbnRJRCByZGY6cmVzb3VyY2U9JzcyODU1MjY0QzJBRDlBRDdCMTdCNjY5NTBCQkU0RDUyJyAvPgogIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MUVFRUEzMkI0NDlBRTYxMThFRkFGOUYxQUE3QjlDMTE8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD43Mjg1NTI2NEMyQUQ5QUQ3QjE3QjY2OTUwQkJFNEQ1MjwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogIDx4bXBNTTpIaXN0b3J5PgogICA8cmRmOlNlcT4KICAgPC9yZGY6U2VxPgogIDwveG1wTU06SGlzdG9yeT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6cGhvdG9zaG9wPSdodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvJz4KICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCIElFQzYxOTY2LTIuMTwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTEwLTI0VDE5OjU1OjU5LTAzOjAwPC94bXA6Q3JlYXRlRGF0ZT4KICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1vZGlmeURhdGU+CiAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1ldGFkYXRhRGF0ZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZXhpZj0naHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8nPgogIDxleGlmOkltYWdlV2lkdGg+MTE5MTwvZXhpZjpJbWFnZVdpZHRoPgogIDxleGlmOkltYWdlTGVuZ3RoPjQwNjwvZXhpZjpJbWFnZUxlbmd0aD4KICA8ZXhpZjpCaXRzUGVyU2FtcGxlPjgsIDgsIDg8L2V4aWY6Qml0c1BlclNhbXBsZT4KICA8ZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPlJWQTwvZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogIDxleGlmOk9yaWVudGF0aW9uPlN1cGVyaW9yIGl6cXVpZXJkYTwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpTYW1wbGVzUGVyUGl4ZWw+MzwvZXhpZjpTYW1wbGVzUGVyUGl4ZWw+CiAgPGV4aWY6WFJlc29sdXRpb24+NzIsMDAwMDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MiwwMDAwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PlB1bGdhZGFzPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpPC9leGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMTY6MTA6MjQgMjA6NDc6MDY8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6Q29tcHJlc3Npb24+Q29tcHJlc2nDs24gSlBFRzwvZXhpZjpDb21wcmVzc2lvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MjwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5QdWxnYWRhczwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5WZXJzacOzbiBFeGlmIDIuMjE8L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPkZsYXNoUGl4IFZlcnNpb24gMS4wPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICA8ZXhpZjpDb2xvclNwYWNlPnNSR0I8L2V4aWY6Q29sb3JTcGFjZT4KICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NTAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTcwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/Pgr/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNG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',width:200 }, 
                         ""],
                    [ '', {text:'LIBRO 1',style:['fecha'],margin: [ 150, 30, 0, 0]}],
                    //[ '', {text:'LIBRO ',style:['fecha'],margin: [ 150, 30, 0, 0]}],
                    [ '', {text:'Fecha '+fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear(),style:['fecha'],margin: [ 150, 0, 0, 0]} ],
                ]
            },
            layout: 'noBorders',
          },
          { text: 'ACTA DE OBRA N° ' + d.n_orden, style: ['header_obra']},
          { text: 'OBRA: '+ libro.obra, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
          { text: 'CONTRATISTA / CONSTRUCTOR O REPRESENTANTE TÉCNICO: '+libro.contratista, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
          { text: 'DESCRIPCIÓN: ' + d.descripcion, style: ['parrafo'],margin: [ 20, 40, 20, 0 ]},
          //{ columns:[] }
        ];

        for (k = 0; k < set_fotos.length; k++) {
          console.log("_AGREGO_FOTO__"+k);
          if(k==set_fotos.length-1){
            set_fotos[k]['pageBreak'] = 'after';
          }
          
          contenido.push(set_fotos[k]);
          
        }

        console.log("___AGREGO ACTA DE OBRA CON FOTO____");
        ordenes.push(contenido);
        numero_ordenes_de_servicios_procesadas++;
        ControlarOrdenesProcesadas();

    }

    function OrdenarOrdenes(){
      var ordenes_ordenadas = [];
      var string,numero;
      for (var i = ordenes.length - 1; i >= 0; i--) {
        string = ordenes[i][1].text.split(" ");
        ordenes_ordenadas[parseInt(string[4])-1] = ordenes[i];

      }
      createPDF(caratula,libro,datos_personales,ordenes_ordenadas);  
    }

      $scope.enviarPDF = function(){
        $cordovaSocialSharing
          .share("Libro de Obra", "Libro de Obra", $scope.pdfUrl)
          .then(function(result) {
              console.log("ENVIADO!");
          }, function(err) {
            console.log("ERROR AL ENVIAR");
        });
      }

    function convertirMes(fecha){
      var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
      return meses[fecha];
    }

    $scope.onError = function (error) {
        console.error(error);
    };

    $scope.onLoad = function () {
        $ionicLoading.hide().then(function(){
         console.log("The loading indicator is now hidden");
      });
    };

    function getDataUri (url,d,j,i,j_max,callback) {
      // j indice de fotos
      // i indice de OS
        var image = new Image();

        image.onload = function () {

            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
            //canvas.width = 100; // or 'width' if you want a special/scaled size
            //canvas.height = 100; // or 'height' if you want a special/scaled size

            canvas.getContext('2d').drawImage(this, 0, 0);
            callback(canvas.toDataURL('image/jpg'),d,j,i,j_max,url);
        };

        image.src = url;
    }

    function ValidarNombrePDF(nombre){
      if (nombre === undefined || nombre === null) {
          return  "Libro_de_obra.pdf";
      }
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(nombre)[1];
      if( nombre != ""){
        if(ext=="pdf"){
          return nombre
        }else{
          return nombre+".pdf";
        }
      }
      return nombre_pdf = "Libro_de_obra.pdf";
    }

    function RandomString() {

      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 3; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    function createPDF(caratula,libro,datos_personales,ordenes){
      console.log("______createPDF_______");
      console.log(JSON.stringify(datos_personales));
      //https://github.com/bpampuch/pdfmake
      //https://jeffleus.github.io/ionic-pdf/www/#/
      console.log(caratula.tarea);
      var campos = caratula.tarea.toString();
      var tarea = "";
      var n = campos.toString().length;
      if(n==3){
        if(campos[1]=="1"){
          tarea = tarea + "Dirección";
        }
        if(campos[2]=="1"){
          tarea = tarea + ", Dirección Ejecutiva";
        }
        if(campos[3]=="1"){
          tarea = tarea + ", Representación Técnica";
        }
      }else{
        if(campos[0]=="1"){
          tarea = tarea + "Proyecto";
        }

        if(campos[1]=="1"){
          tarea = tarea + ", Direción";
        }
        if(campos[2]=="1"){
          tarea = tarea + ", Dirección Ejecutiva";
        }
        if(campos[3]=="1"){
          tarea = tarea + ", Representación Técnica";
        }
      }
      
      console.log("TAREA PROFESIONAL!");
      console.log(tarea);
      var docDefinition = {
        pageSize: 'A4',
        //METADATA
        info: {
          title: 'Libro de Obra',
          author: 'Autor',
          subject: 'Asunto',
          keywords: 'Resumen',
        },
        footer: function(currentPage, pageCount) {
          var hoy = new Date();
          var hoy_string = "Hoja "+currentPage.toString() + ' de ' + pageCount + " Acta de Obra " + hoy.getDate()+"/"+(hoy.getMonth()+1)+"/"+hoy.getFullYear();
          return { text: hoy_string , alignment:'right' ,margin: [ 40, 10, 40, 40 ],fontSize: 10, };
        },
        pageMargins: [ 40, 30, 50, 50 ],
        content: [
          {
            columns: [
              { text: 'CARATULA / DATOS DE LA OBRA',style: ['header']},
              { 
                style: ['logo'],
                image: 'data:image/jpeg;base64,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UUUUAYv9099v9TRRRQB//9n/4Qo8aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjFFRUVBMzJCNDQ5QUU2MTE4RUZBRjlGMUFBN0I5QzExPC94bXBNTTpJbnN0YW5jZUlEPgogIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+NzI4NTUyNjRDMkFEOUFEN0IxN0I2Njk1MEJCRTRENTI8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICA8eG1wTU06RG9jdW1lbnRJRCByZGY6cmVzb3VyY2U9JzcyODU1MjY0QzJBRDlBRDdCMTdCNjY5NTBCQkU0RDUyJyAvPgogIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MUVFRUEzMkI0NDlBRTYxMThFRkFGOUYxQUE3QjlDMTE8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD43Mjg1NTI2NEMyQUQ5QUQ3QjE3QjY2OTUwQkJFNEQ1MjwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogIDx4bXBNTTpIaXN0b3J5PgogICA8cmRmOlNlcT4KICAgPC9yZGY6U2VxPgogIDwveG1wTU06SGlzdG9yeT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6cGhvdG9zaG9wPSdodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvJz4KICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCIElFQzYxOTY2LTIuMTwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTEwLTI0VDE5OjU1OjU5LTAzOjAwPC94bXA6Q3JlYXRlRGF0ZT4KICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1vZGlmeURhdGU+CiAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1ldGFkYXRhRGF0ZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZXhpZj0naHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8nPgogIDxleGlmOkltYWdlV2lkdGg+MTE5MTwvZXhpZjpJbWFnZVdpZHRoPgogIDxleGlmOkltYWdlTGVuZ3RoPjQwNjwvZXhpZjpJbWFnZUxlbmd0aD4KICA8ZXhpZjpCaXRzUGVyU2FtcGxlPjgsIDgsIDg8L2V4aWY6Qml0c1BlclNhbXBsZT4KICA8ZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPlJWQTwvZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogIDxleGlmOk9yaWVudGF0aW9uPlN1cGVyaW9yIGl6cXVpZXJkYTwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpTYW1wbGVzUGVyUGl4ZWw+MzwvZXhpZjpTYW1wbGVzUGVyUGl4ZWw+CiAgPGV4aWY6WFJlc29sdXRpb24+NzIsMDAwMDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MiwwMDAwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PlB1bGdhZGFzPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpPC9leGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMTY6MTA6MjQgMjA6NDc6MDY8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6Q29tcHJlc3Npb24+Q29tcHJlc2nDs24gSlBFRzwvZXhpZjpDb21wcmVzc2lvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MjwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5QdWxnYWRhczwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5WZXJzacOzbiBFeGlmIDIuMjE8L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPkZsYXNoUGl4IFZlcnNpb24gMS4wPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICA8ZXhpZjpDb2xvclNwYWNlPnNSR0I8L2V4aWY6Q29sb3JTcGFjZT4KICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NTAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTcwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/Pgr/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNG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',
                width: 200,
              }
            ]
          },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth:1 }]},
          { text: 'Profesional Actuante: '+datos_personales.profesional, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
          { text: 'Matrícula N°: '+datos_personales.matricula, style: ['datos_caratula'],margin: [ 40, 20, 20, 0 ]},
          { text: 'Domicilio:', style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
          { 
             columns: [
              {text: 'Calle: '+datos_personales.calle, style: ['datos_caratula'],margin: [ 40, 10, 0, 0 ]},
              {text: 'N°: '+datos_personales.altura, style: ['datos_caratula'],margin: [ 0, 10, 0, 0 ]},
              {text: 'Dto: '+datos_personales.departamento, style: ['datos_caratula'],margin: [ 0, 10, 0, 0 ]},
              {text: 'Localidad: '+datos_personales.localidad, style: ['datos_caratula'],margin: [ 0, 10, 0, 0 ]},
            ]
          },
          { text: 'Telefono de Contacto: '+datos_personales.telefono, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
          { text: 'Email: '+datos_personales.email, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
          { 
            columns:[
              {text: 'Dirección de Obra: '+caratula.direccion_obra, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
              {text: 'Localidad: '+caratula.localidad_obra, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},

            ]
          },
          {
            columns:[
              {text: 'Expediente Municipal N°: '+caratula.expediente_municipal, style: ['datos_caratula'],margin: [ 40, 10, 20, 0 ]},
              {text: 'Municipal de: '+caratula.municipalidad_obra, style: ['datos_caratula'],margin: [ 40, 10, 20, 0 ]},
            ]
          },
          { text: 'Expediente CAPBA: '+caratula.expdiente_capba, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
          { text: 'Duración de la Obra: '+caratula.duracion, style: ['datos_caratula'],margin: [ 40, 10, 20, 0 ]},
          { text: 'Superfiecie cubierta de la Obra: '+caratula.superficie, style: ['datos_caratula'],margin: [ 40, 40, 20, 0 ]},
          { text: 'Superfiecie semicubierta de la Obra: '+caratula.superficie_semi, style: ['datos_caratula'],margin: [ 40, 10, 20, 0 ]},
          { text: 'Tarea Profesional: '+tarea, style: ['datos_caratula'],pageBreak: 'after',margin: [ 40, 40, 20, 0 ]},
          /* PAGE BREAKE */
          { text: '', pageBreak: 'before'},
          /* PAGE BREAKE */
          {
            style: ['logo_obra'],
            image: 'data:image/jpeg;base64,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UUUUAYv9099v9TRRRQB//9n/4Qo8aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjFFRUVBMzJCNDQ5QUU2MTE4RUZBRjlGMUFBN0I5QzExPC94bXBNTTpJbnN0YW5jZUlEPgogIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+NzI4NTUyNjRDMkFEOUFEN0IxN0I2Njk1MEJCRTRENTI8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICA8eG1wTU06RG9jdW1lbnRJRCByZGY6cmVzb3VyY2U9JzcyODU1MjY0QzJBRDlBRDdCMTdCNjY5NTBCQkU0RDUyJyAvPgogIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MUVFRUEzMkI0NDlBRTYxMThFRkFGOUYxQUE3QjlDMTE8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD43Mjg1NTI2NEMyQUQ5QUQ3QjE3QjY2OTUwQkJFNEQ1MjwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogIDx4bXBNTTpIaXN0b3J5PgogICA8cmRmOlNlcT4KICAgPC9yZGY6U2VxPgogIDwveG1wTU06SGlzdG9yeT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6cGhvdG9zaG9wPSdodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvJz4KICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCIElFQzYxOTY2LTIuMTwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTEwLTI0VDE5OjU1OjU5LTAzOjAwPC94bXA6Q3JlYXRlRGF0ZT4KICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1vZGlmeURhdGU+CiAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1ldGFkYXRhRGF0ZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZXhpZj0naHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8nPgogIDxleGlmOkltYWdlV2lkdGg+MTE5MTwvZXhpZjpJbWFnZVdpZHRoPgogIDxleGlmOkltYWdlTGVuZ3RoPjQwNjwvZXhpZjpJbWFnZUxlbmd0aD4KICA8ZXhpZjpCaXRzUGVyU2FtcGxlPjgsIDgsIDg8L2V4aWY6Qml0c1BlclNhbXBsZT4KICA8ZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPlJWQTwvZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogIDxleGlmOk9yaWVudGF0aW9uPlN1cGVyaW9yIGl6cXVpZXJkYTwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpTYW1wbGVzUGVyUGl4ZWw+MzwvZXhpZjpTYW1wbGVzUGVyUGl4ZWw+CiAgPGV4aWY6WFJlc29sdXRpb24+NzIsMDAwMDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MiwwMDAwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PlB1bGdhZGFzPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpPC9leGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMTY6MTA6MjQgMjA6NDc6MDY8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6Q29tcHJlc3Npb24+Q29tcHJlc2nDs24gSlBFRzwvZXhpZjpDb21wcmVzc2lvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MjwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5QdWxnYWRhczwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5WZXJzacOzbiBFeGlmIDIuMjE8L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPkZsYXNoUGl4IFZlcnNpb24gMS4wPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICA8ZXhpZjpDb2xvclNwYWNlPnNSR0I8L2V4aWY6Q29sb3JTcGFjZT4KICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NTAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTcwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/Pgr/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNG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',
            width: 200,
          },
          { text: 'HABILITACIÓN DEL LIBRO DE OBRA',style: ['header_obra']},
          { text: 'OBRA: '+libro.obra, style: ['datos'],margin: [ 20, 40, 20, 0 ]},
          { text: 'UBICACIÓN: '+libro.ubicacion, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
          { text: 'DATOS CATASTRALES: ', style: ['datos'],margin: [ 20, 20, 20, 0 ]},
          { 
            columns:[
              {text: 'CIRC: '+libro.CIRC, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
              {text: 'SECC: '+libro.SECC, style: ['datos'],margin: [ 0, 20, 20, 0 ]},
              {text: 'MZ: '+libro.MZ, style: ['datos'],margin: [ 0, 20, 30, 0 ]},
              {text: 'PRCELA: '+libro.parcela, style: ['datos'],margin: [ 0, 20, 20, 0 ]},
              {text: 'PARTIDA: '+libro.partida, style: ['datos'],margin: [ 0, 20, 20, 0 ]},

            ]
          },
          { text: 'EXPEDIENTE: '+libro.expediente, style: ['datos'],margin: [ 20, 20, 20, 0 ]},
          { text: 'En la ciudad de '+caratula.caratula+" a los "+ libro.fecha.getDate() +" días del mes de "+convertirMes(libro.fecha.getMonth())+" del año "+libro.fecha.getFullYear()+" el/la Director de Obra "+libro.director+" , el/la Comitente Sr./Sra. "+libro.contratista+" y el/la Contratista/Constructor o Responsable Técnico "+libro.contratista+ " proceden a habilitar el presente libro de obra, que consta de ordenes que deban impartirse al Contratista / Constructor o Representante Técnico a fin de ejecutar las tareas en un todo de acuerdo a la documentación gráfica y escrita presentada al efecto. Las órdenes de Servicio que se emitan, serán signadas por el Director de Obra, debiendo el Contratista / Constructor o Representante Técnico notificarse en todas y cada una de ellas.", margin: [ 20, 40, 20, 0 ],style: ['parrafo']},
          { text: 'En prueba de conformidad, las partes firman el presente libro.', style: ['parrafo'],margin: [ 20, 10, 20, 0 ]},
          {
            columns:[
              {text: '....................................................................',style: ['puntos'],margin: [ 0, 150, 0, 0 ]},
              {text: '....................................................................',style: ['puntos'],margin: [ 0, 150, 0, 0 ]},
              {text: '....................................................................',style: ['puntos'],margin: [ 0, 150, 0, 0 ]},

            ]
          },
          {
            columns:[
              {text: 'Firma de director de obra',style: ['firma'],margin: [ 20, 10, 20, 0 ]},
              {text: 'Firma Comitente',style: ['firma'],margin: [ 20, 10, 20, 0 ]},
              {text: 'Firma Constructor / Contratista \n Representante Técnico',style: ['firma'],margin: [ 20, 10, 20, 0 ]},

            ]
          },
          { text: '', pageBreak: 'after'},
          // PAGE BREAK
          { text: '', pageBreak: 'before'},
          /* PAGE BREAKE */
          {
            style: ['logo_obra'],
            image: 'data:image/jpeg;base64,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UUUUAYv9099v9TRRRQB//9n/4Qo8aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjFFRUVBMzJCNDQ5QUU2MTE4RUZBRjlGMUFBN0I5QzExPC94bXBNTTpJbnN0YW5jZUlEPgogIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+NzI4NTUyNjRDMkFEOUFEN0IxN0I2Njk1MEJCRTRENTI8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICA8eG1wTU06RG9jdW1lbnRJRCByZGY6cmVzb3VyY2U9JzcyODU1MjY0QzJBRDlBRDdCMTdCNjY5NTBCQkU0RDUyJyAvPgogIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MUVFRUEzMkI0NDlBRTYxMThFRkFGOUYxQUE3QjlDMTE8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD43Mjg1NTI2NEMyQUQ5QUQ3QjE3QjY2OTUwQkJFNEQ1MjwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogIDx4bXBNTTpIaXN0b3J5PgogICA8cmRmOlNlcT4KICAgPC9yZGY6U2VxPgogIDwveG1wTU06SGlzdG9yeT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6cGhvdG9zaG9wPSdodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvJz4KICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCIElFQzYxOTY2LTIuMTwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTEwLTI0VDE5OjU1OjU5LTAzOjAwPC94bXA6Q3JlYXRlRGF0ZT4KICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1vZGlmeURhdGU+CiAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0xMC0yNFQyMDo0NzowNi0wMzowMDwveG1wOk1ldGFkYXRhRGF0ZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZXhpZj0naHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8nPgogIDxleGlmOkltYWdlV2lkdGg+MTE5MTwvZXhpZjpJbWFnZVdpZHRoPgogIDxleGlmOkltYWdlTGVuZ3RoPjQwNjwvZXhpZjpJbWFnZUxlbmd0aD4KICA8ZXhpZjpCaXRzUGVyU2FtcGxlPjgsIDgsIDg8L2V4aWY6Qml0c1BlclNhbXBsZT4KICA8ZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPlJWQTwvZXhpZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogIDxleGlmOk9yaWVudGF0aW9uPlN1cGVyaW9yIGl6cXVpZXJkYTwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpTYW1wbGVzUGVyUGl4ZWw+MzwvZXhpZjpTYW1wbGVzUGVyUGl4ZWw+CiAgPGV4aWY6WFJlc29sdXRpb24+NzIsMDAwMDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MiwwMDAwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PlB1bGdhZGFzPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpPC9leGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMTY6MTA6MjQgMjA6NDc6MDY8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6Q29tcHJlc3Npb24+Q29tcHJlc2nDs24gSlBFRzwvZXhpZjpDb21wcmVzc2lvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MjwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5QdWxnYWRhczwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5WZXJzacOzbiBFeGlmIDIuMjE8L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPkZsYXNoUGl4IFZlcnNpb24gMS4wPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICA8ZXhpZjpDb2xvclNwYWNlPnNSR0I8L2V4aWY6Q29sb3JTcGFjZT4KICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NTAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTcwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/Pgr/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNG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',
            width: 200,
          },
          { text: 'ACTA DE INICIO DE OBRA',style: ['header_obra']},
          { text: 'OBRA: '+libro.obra, style: ['datos'],margin: [ 20, 30, 20, 0 ]},
          { text: 'UBICACIÓN: '+libro.ubicacion, style: ['datos'],margin: [ 20, 15, 20, 0 ]},
          { text: 'DATOS CATASTRALES: ', style: ['datos'],margin: [ 20, 15, 20, 0 ]},
          { 
            columns:[
              {text: 'CIRC: '+libro.CIRC, style: ['datos'],margin: [ 20, 15, 20, 0 ]},
              {text: 'SECC: '+libro.SECC, style: ['datos'],margin: [ 0, 15, 20, 0 ]},
              {text: 'MZ: '+libro.MZ, style: ['datos'],margin: [ 0, 15, 30, 0 ]},
              {text: 'PRCELA: '+libro.parcela, style: ['datos'],margin: [ 0, 15, 20, 0 ]},
              {text: 'PARTIDA: '+libro.partida, style: ['datos'],margin: [ 0, 15, 20, 0 ]},

            ]
          },
          { text: 'EXPEDIENTE: '+libro.expediente, style: ['datos'],margin: [ 20, 15, 20, 0 ]},
          { text: 'En la ciudad de '+caratula.caratula+" a los "+ libro.fecha.getDate() +" días del mes de "+convertirMes(libro.fecha.getMonth())+" del año "+libro.fecha.getFullYear()+" se reunen el/la Contratista / Constructor o Representante Técnico "+libro.contratista+" y el/la Director de Obra "+libro.director+" quienes suscriben el presente acta a los efectos de dejar constancia del inicio de la obra de referencia la cual se ejecutará en un todo de acuerdo al/los contratos suscriptos. Se deja constancia ademas, que el día de la fecha se tendrá por fecha cierta, a partir de la cual se computaran los plazos para la ejecución de los trabajos acordados. El Contratista / Constructor o Representante Técnico, procederá a verificar si las medidas existentes en el terreno están en un todo de acuerdo con las de la documentación del proyecto. En caso de objeciones u observaciones, las podrá formular en un plazo no mayor a las 48 hs. desde la firma del presente acta. En caso de que así fuere, los plazos de ejecución tendrán efecto suspensivo hasta que la Dirección de Obra haga entrega de la documentación con la ratificatoria correspondiente, fecha a partir de la cual operan los plazos de obra. En el supuesto que el Contratista / Constructor o Representante Técnico no formule observaciones a la documentación entregada, se tendrá por no observada por el Director de Obra.", margin: [ 20, 30, 20, 0 ],style: ['parrafo']},
          { text: 'En prueba de conformidad, las partes suscriben el acta.', style: ['parrafo'],margin: [ 20, 10, 20, 0 ]},
          {
            columns:[
              {text: '....................................................................',style: ['puntos'],margin: [ 0, 100, 0, 0 ]},
              {text: '....................................................................',style: ['puntos'],margin: [ 0, 100, 0, 0 ]},
              {text: '....................................................................',style: ['puntos'],margin: [ 0, 100, 0, 0 ]},

            ]
          },
          {
            columns:[
              {text: 'Firma de director de obra',style: ['firma'],margin: [ 20, 10, 20, 0 ]},
              {text: 'Firma Comitente',style: ['firma'],margin: [ 20, 10, 20, 0 ]},
              {text: 'Firma Constructor / Contratista \n Representante Técnico',style: ['firma'],margin: [ 20, 10, 20, 0 ]},

            ]
          },
          { text: '', pageBreak: 'after'},
          // PAGE BREAK
          { text: '', pageBreak: 'before'},
          /* PAGE BREAKE */
        ],

        styles: {
          header: {
            fontSize: 14,
            bold: true,
            alignment: 'left',
            // margin: [left, top, right, bottom]
            margin: [ 0, 75, 0, 5]
          },
          logo:{
            alignment: 'right',
            margin: [ 0, 20, 0, 5]
          },
          header_obra: {
            fontSize: 14,
            bold: true,
            alignment: 'center',
            // margin: [left, top, right, bottom]
            margin: [ 0, 30, 0, 10]
          },
          datos_caratula:{
            fontSize: 12,
            alignment: 'left'
          },
          datos:{
            fontSize: 11,
            alignment: 'left',
          },
          parrafo:{
            fontSize: 11,
            alignment: 'justify',
            lineHeight: 1.8
          },
          fecha:{
            fontSize: 12,
            alignment: 'left',
          },
          logo_obra:{
            alignment: 'left',
            margin: [ 20, 0, 20, 0 ]
          },
          fotos:{
            alignment: 'center',
            margin: [ 10, 10, 10, 0 ]
          },
          foto_pagina:{
            margin: [ 10, 10, 10, 0 ]
          },
          firma:{
            fontSize: 8,
            alignment: 'center'
          },
          puntos:{
            fontSize: 8,
            alignment: 'center'
          }
        },
        defaultStyle: {
          font: 'Calibri'
        }
      };      

      docDefinition.content.push(ordenes);
      //console.log(docDefinition);

      //http://stackoverflow.com/questions/30188947/cordovafile-checkdir-says-folder-does-not-exist-but-cordovafile-createdir-says
      pdfMake.fonts = {
         Calibri: {
           normal: 'Calibri.ttf',
           bold: 'CalibriBold.ttf',
         }
      };
      $cordovaFile.checkFile(carpeta_pdf, nombre_pdf).then(function(success){
        console.log("EXISTE EL PDF");
        $cordovaFile.removeFile(carpeta_pdf, nombre_pdf).then(function(success){
            console.log("__BORRADO PDF___");
            GenerarPDF();
          },function(error){
            console.log("__ERROR BORRANDO PDF");
            console.log(JSON.stringify(error));
          });
      },function(error){
        console.log("NO EXISTE EL PDF")
        GenerarPDF();
      });

      function GenerarPDF(){
        console.log("__________GenerarPDF___________");
        //pdfMake.createPdf(docDefinition).open();
        pdfMake.createPdf(docDefinition).getBuffer(function (buffer) {
          var temp;
          var utf8 = new Uint8Array(buffer); // Convert to UTF-8... 
          binaryArray = utf8.buffer; // Convert to Binary...
          var ran = RandomString();

          nombre_pdf = nombre_pdf.slice(0, -4); // elimino la extension .pdf
          temp = nombre_pdf.split("-");
          nombre_pdf = temp[0]+"-"+ran+".pdf";

          console.log(nombre_pdf);

          $cordovaFile.writeFile(carpeta_pdf, nombre_pdf, binaryArray, true)
              .then(function (success) {
                console.log("___success PDF_____");
                $scope.pdfUrl = carpeta_pdf+nombre_pdf;
                $scope.nombrePDF = nombre_pdf;

                wSQL.update("caratulas", {pdf: nombre_pdf})
                  .where("id", $scope.id_caratula)
                  .query()
                  .then(function(result){
                      console.log("___Actualizadada la URL en la DB__");
                  });

              }, function (error) {
                  console.log("error");
                  console.log(JSON.stringify(error));
          });
      });
    }

      }// End CreatePDF
      

  }); //ENd Controller

  app.controller('OrdenDeServicioCtrl',function($scope,FileService,ImageService,$state,wSQL,$ionicNavBarDelegate,$location,$cordovaCamera,$ionicBackdrop, $ionicSlideBoxDelegate, $ionicScrollDelegate,$cordovaFile,$cordovaDevice,$ionicActionSheet,$ionicPlatform,$ionicPopup){
      /* Limpiar Storage */
      localStorage.removeItem("fotos");

      $scope.id_caratula = parseInt($state.params.id_caratula);
      $scope.id_orden = parseInt($state.params.id_orden);
      $scope.allImages = [];
      $scope.zoomMin = 1;
      window.localStorage.setItem("fotos_para_eliminar",null);

      if(isNaN($scope.id_caratula) || $scope.id_caratula == 0 || $scope.id_caratula == "0" || isNaN($scope.id_orden) ){
        $location.path('/listado_caratulas/');
      }

      $ionicNavBarDelegate.showBackButton(true);

      $scope.FormValues = {};
      $scope.exist = false;

       /* Tomar datos de actas_inicio_obra*/
       wSQL.select()
          .from("actas_inicio_obra")
          .where("id", $scope.id_caratula)
          .row()
          .then(function(c){
            $scope.obra = c[0].obra;
            $scope.contratista = c[0].contratista;
            InitOrdenServicio();
          });

      function InitOrdenServicio(){
        console.log("___InitOrdenServicio___");
        if($scope.id_orden!=0){
          /* Agarro una Orden de Servicio en teoria Existente*/
          wSQL.select()
            .from("ordenes_de_servicios")
            .where("id", $scope.id_orden)
            .row()
            .then(function(d){
              $scope.FormValues.n_orden = d[0].n_orden;
              if(d.length>0){
                /* Existe la Orden de servicio*/
                console.log("Existe la Orden de servicio");
                $scope.FormValues = d[0];
                $scope.exist = true;
                $scope.FormValues.fecha2 = new Date($scope.FormValues.fecha);
                window.localStorage.setItem("fotos", d[0].fotos);
              }else{
                /* No Existe la Orden de servicio*/
                console.log("No Existe la Orden de servicio");
                $scope.FormValues.fecha2 = new Date();
                wSQL.select()
                  .from("ordenes_de_servicios")
                  .where("id_caratula", $scope.id_caratula)
                  .query()
                  .then(function(d){
                    $scope.FormValues.fecha2 = new Date();
                    //$scope.images = FileService.images();
                    $scope.FormValues.n_orden = d.length + 1;
                  });
              }
              $scope.images = FileService.images();
            });
        }else{
          /*Estoy creando la Orden de Servicio*/
          wSQL.select()
            .from("ordenes_de_servicios")
            .where("id_caratula", $scope.id_caratula)
            .query()
            .then(function(d){
              $scope.FormValues.fecha2 = new Date();
              $scope.images = FileService.images();
              $scope.FormValues.n_orden = d.length + 1;
            });
        }

      }

      $scope.showPopup = function(imagen,id) {        
        var url = cordova.file.dataDirectory + imagen; 
        console.log(imagen);
        console.log(url);

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: ' <img ng-src="'+url+'" style="width:100%; padding: 5px 5px 5px 5px;"/>',
          scope: $scope,
          title: 'Ver foto',
          subTitle: 'Para borrar la foto debe guardar los cambios.',
          buttons: [
            { text: 'Cancelar',
              type: 'button-positive'
            },
            {
              text: '<b>Borrar</b>',
              type: 'button-assertive',
              onTap: function(e) {


                var fotos_guardadas = JSON.parse(window.localStorage.getItem("fotos"));
                var index = fotos_guardadas.indexOf(url);
                
                fotos_guardadas.splice(index,1); 
                $scope.images.splice(id,1);

                window.localStorage.setItem("fotos", JSON.stringify(fotos_guardadas));

                var lista = window.localStorage.getItem("fotos_para_eliminar");

                  if (lista == null || lista == "null") {
                    lista_de_fotos = [];
                  } else {
                    lista_de_fotos = JSON.parse(lista);
                  }

                  lista_de_fotos.push(url);
                  window.localStorage.setItem("fotos_para_eliminar", JSON.stringify(lista_de_fotos));

                console.log("___BORRADA LA FOTO DE LA LISTA____");
              }
            }
          ]
        });
      }

      $scope.ProcesarOrdenServicio = function() {
        $scope.FormValues.id_caratula = parseInt($scope.id_caratula);
        $scope.FormValues.fecha = $scope.FormValues.fecha2.toString();
        $scope.FormValues.fotos = window.localStorage.getItem("fotos") || "";

        delete $scope.FormValues.fecha2;
        if($scope.exist){
          wSQL.update("ordenes_de_servicios", $scope.FormValues)
             .where("id", $scope.id_orden)
              .query()
              .then(function(result){
                  $location.path('/listado_ordenes_servicios/'+$scope.id_caratula);
              })
        }else{
          wSQL.insert("ordenes_de_servicios", $scope.FormValues)
            .then(function(insert){
              if(insert !== null && typeof insert === 'object'){
                $location.path('/listado_ordenes_servicios/'+$scope.id_caratula);
              }
            });
          }

        localStorage.removeItem("fotos");
        var lista = window.localStorage.getItem("fotos_para_eliminar");
        if (lista) {
          lista_de_fotos = JSON.parse(lista);

          for (var i = lista_de_fotos.length - 1; i >= 0; i--) {
            $cordovaFile.removeFile(lista_de_fotos[i]).then(function(success){
              console.log("__FOTO BORRAR___");
              console.log(lista_de_fotos[i]);
            },function(error){
              console.log("__ERROR BORRANDO FOTOS");
            });
            
          }
        }
      }

      $scope.urlForImage = function(imageName) {
        var trueOrigin = cordova.file.dataDirectory + imageName;
        return trueOrigin;
      }

      $scope.addImage = function(type) {
        //$scope.hideSheet();
        ImageService.handleMediaDialog(type).then(function() {
          _.defer(function(){
            $scope.$apply();
          });
        });
      }

      $scope.addMedia = function() {
        $scope.addImage(0);
        /*$scope.hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: 'Sacar foto' },
            { text: 'Buscar en Album' }
          ],
          titleText: 'Agregar Imagen',
          cancelText: 'Cancelar',
          buttonClicked: function(index) {
            $scope.addImage(index);
          }
        });*/
      }

  });

  app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  });
}());