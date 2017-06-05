(function(){
	var app = angular.module('colegio_arquitectos.config', []);

	app.config(function($stateProvider, $urlRouterProvider){

	    $stateProvider.state('caratula',{
	      url:'/caratula/:id',
	      controller:'CaratulaCtrl',
	      templateUrl:'templates/caratula.html'
	    })

	    $stateProvider.state('acta_inicio_obra',{
	      url:'/acta_inicio_obra/:id_caratula', // id de caratula
	      controller:'ActaInicioObraCtrl',
	      templateUrl:'templates/acta_inicio_obra.html'
	    })

	    $stateProvider.state('listado_caratulas',{
	      url:'/listado_caratulas',
	      controller:'ListadoCaratulasCtrl',
	      templateUrl:'templates/listado_caratulas.html'
	    })

	    $stateProvider.state('listado_ordenes_servicios',{
	      url:'/listado_ordenes_servicios/:id_caratula', // id de cartula
	      controller:'ListadoOrdenesServiciosCtrl',
	      templateUrl:'templates/listado_ordenes_servicios.html'
	    })

	    $stateProvider.state('orden_servicio',{
	      url:'/orden_servicio/:id_caratula/:id_orden', // id de caratula
	      controller:'OrdenDeServicioCtrl',
	      templateUrl:'templates/orden_servicio.html'
	    })

	    $stateProvider.state('pdf',{
	      url:'/pdf/:id_caratula', // id de caratula
	      controller:'PDFCtrl',
	      templateUrl:'templates/pdf.html'
	    })

	    $stateProvider.state('ver_pdf',{
	      url:'/pdf/:id_caratula', // id de caratula
	      controller:'VerPDFCtrl',
	      templateUrl:'templates/pdf.html'
	    })

	    $stateProvider.state('datos_personales',{
	      url:'/datos_personales', // id de caratula
	      controller:'DatosPersonalesCtrl',
	      templateUrl:'templates/datos_personales.html'
	    })

	    $stateProvider.state('login',{
	      url:'/login', // id de caratula
	      controller:'LoginCtrl',
	      templateUrl:'templates/login.html'
	    })

	    $urlRouterProvider.otherwise('/login');
	  });
 })();