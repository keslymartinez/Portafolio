/** $(document).ready(function(){
$('ul.tabs li a:first').addClass('active');
$('.sesiones article').hide();
$('.sesiones article:first').show();


$('ul.tabs li a').click(function(){
	$('ul.tabs li a').removeClass('active');
	$(this).addClass('active');
	$('.sesiones article').hide();

	var activeTab = $(this).attr('href');
	$(activeTab).show();
	return false;

	});
});
**/ 
	
$( document ).ready(function() {

   $('body').scrollspy({ target: '.navbar-fixed-top' })
});



var  typed = new Typed ('.white-text', {
	strings:['Me encanta buscar cosas nuevas apasionada por la tecnologia estoy en constante aprendizaje que me lleve mas lejos.','Hola soy Kesly Martinez!','Frontend Developer!'],
	typeSpeed:100,
	backSpeed:100,
	fadeOut:true,
	loop:true,
})
//  boton para ver portafolio

     
