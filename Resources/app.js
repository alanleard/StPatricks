// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');


var color1 = '#336600';
var color2 = '#66cc00';
var color3 = '#66cc00';

Ti.Geolocation.purpose="GPS is used to map your beers and your friends!  Enable GPS for best results.";
// create tab group
var tabGroup = Titanium.UI.createTabGroup();

var wait = Ti.UI.createView({
	visible:false
});

var actInd = Ti.UI.createActivityIndicator({
	style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
	color:'white'
});

var actBase = Ti.UI.createView({
	height:100,
	width:300,
	backgroundColor:'black',
	borderRadius:15,
	opacity:0.7
});

actBase.add(actInd);
actInd.show();

wait.add(actBase);

tabGroup.add(wait);

var annotations = [];
var data = [];
if(!Ti.App.Properties.hasProperty('count')){
	
	Ti.App.Properties.setInt('count', 0);
	
}
if(Ti.App.Properties.hasProperty('table')){
	
	data = JSON.parse(Ti.App.Properties.getString('table'));
	
}
if(Ti.App.Properties.hasProperty('map')){
	annotations = JSON.parse(Ti.App.Properties.getString('map'));
	
}
//
// create base UI tab and root window
//
var logBeer = Ti.UI.createButton({
	title:'Log a Beer'
});
logBeer.addEventListener('click', function(){
	actInd.message = 'Getting Beer Location...'
	wait.show();
	beerTracker();
})
var win1 = Titanium.UI.createWindow({  
    title:'Beers',
    backgroundColor:'#fff',
    rightNavButton:logBeer,
    barColor:color1
});

var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Beers',
    window:win1
});

var tableView = Ti.UI.createTableView({
	backgroundColor:color2,
	data:data,
	editable:true
});
var edit = Ti.UI.createButton({
	title:'Edit'
});
var done = Ti.UI.createButton({
	title:'Done'
});

edit.addEventListener('click', function(){
	tableView.editing = true;
	win1.setLeftNavButton(done);
});

done.addEventListener('click', function(){
	tableView.editing = false;
	win1.setLeftNavButton(edit);
});

tableView.addEventListener('delete',function(e){
	annotations.splice(e.index,1);
	data.splice(e.index,1);
	Ti.App.Properties.setString('table',JSON.stringify(data));
	Ti.App.Properties.setString('map',JSON.stringify(annotations));
	var count = Ti.App.Properties.getInt('count');
	Ti.App.Properties.setInt('count', count-=1);
	mapView.removeAnnotation(e.rowData.title);
})
win1.setLeftNavButton(edit);
var mapView = Ti.Map.createView({
	visible:false,
	annotations:annotations,
	animate:true
});

var mapClose = Ti.UI.createButton({
	title:'Hide Map',
	height:40,
	width:80,
	top:5,
	right:5
});

//mapView.add(mapClose);

mapClose.addEventListener('click',function(){
	tableView.show();
	mapView.hide();
	win1.setRightNavButton(logBeer);
	
});
win1.add(mapView);

var image = Ti.UI.createImageView({
	visible:false
});
tabGroup.add(image);
image.addEventListener('click', function(){
	image.hide();
});

tableView.addEventListener('click', function(e){
	if(e.rowData.userLat != null){

		mapView.region={latitude:e.rowData.userLat,longitude:e.rowData.userLon,latitudeDelta:0.01, longitudeDelta:0.01};
		
		
		mapView.addEventListener('click', function(x){
			if(x.clicksource=='leftButton'){
				
					image.image = x.annotation.beer

				
				image.show();
				
			}
		});
		win1.setRightNavButton(mapClose);
		mapView.show();
		mapView.selectAnnotation(e.rowData.title);
		tableView.hide();
		
	} else {
		
			image.image = e.rowData.beer
		image.show();
	
	}
});
win1.add(tableView);

function beerTracker(){
	var count = Ti.App.Properties.getInt('count');
	Ti.App.Properties.setInt('count', count+=1);
	var now = new Date();
	var date = now.toLocaleDateString() +" at "+ now.toLocaleTimeString();
	var userLat=null;
	var userLon=null;
	Titanium.Geolocation.getCurrentPosition(function(e)
	{
		
		if(e.success){
			
			userLat=e.coords.latitude;
			userLon=e.coords.longitude;
			
			track();
			//directionsURL = 'http://maps.google.com/maps?saddr='+userLat+','+userLon+'&daddr='
		
			//mapview.region={latitude:latitude,longitude:longitude,latitudeDelta:latDelta, longitudeDelta:longDelta};
		}
		if(e.error){
			
			track();
			//alert('We are having trouble getting your location.  Please ensure your GPS is enabled.');
		}
	});
	
	function track(){
	var view = Ti.UI.createView();
	
	var textField = Ti.UI.createTextField({
		hintText:'Add a title...',
		left:'10',
		height:'40',
		top:5,
		width:240,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	view.add(textField);
	var button = Ti.UI.createButton({
		title:'Take Picture',
		width:200,
		right:10,
		height:40,
		bottom:10,
		color:'white',
		backgroundLeftCap:20,
		backgroundTopCap:20,
		backgroundSelectedImage:'buttonDown.png',
		backgroundImage:'buttonUp.png'
	});
	view.add(button);
	var cancel = Ti.UI.createButton({
		title:'Cancel',
		width:70,
		left:10,
		height:40,
		bottom:10,
		color:'white',
		backgroundLeftCap:20,
		backgroundTopCap:20,
		backgroundSelectedImage:'buttonDown.png',
		backgroundImage:'buttonUp.png'
	});
	view.add(cancel);
	var cameras = Ti.Media.availableCameras;
	var t1 = Ti.UI.iOS.create3DMatrix();
	for (var c=0;c<cameras.length;c++)
{

	if (cameras[c]==Ti.Media.CAMERA_REAR)
		{
			var flipBtn = Titanium.UI.createButton({
				top:5,
				right:10,
				height:40,
				width:50,
				font:{fontSize:20,fontWeight:'bold',fontFamily:'Helvetica Neue'},
				title:'Flip',
				color:'white',
				backgroundLeftCap:20,
				backgroundTopCap:20,
				backgroundSelectedImage:'buttonDown.png',
				backgroundImage:'buttonUp.png'
			});
			
			view.add(flipBtn);		
			
			flipBtn.addEventListener('click', function(){
				if (Ti.Media.camera == 0){ //back camera 
					Ti.Media.switchCamera(1); 
					t1 = t1.rotate(180,0,1,0);
				}
				else{
					Ti.Media.switchCamera(0);
				}
			});
	}
}
	button.addEventListener('click',function()
	{
		Ti.Media.takePicture();
	});
	
	cancel.addEventListener('click', function(){
		Ti.Media.hideCamera();
	});
	wait.hide();
	Titanium.Media.showCamera({
	
		success:function(event){
			actInd.message = 'Saving Beer Data...'
			wait.show();
		var large = Ti.UI.createImageView({
	 		image: event.media,
	 		height:Ti.Platform.displayCaps.platformHeight-20,
	 		width:Ti.Platform.displayCaps.platformWidth,
	 		transform:t1
	 	});
	 	var main = Titanium.Filesystem.applicationDataDirectory + "/" + new Date().getTime() + ".png";
	 	mainImage = Titanium.Filesystem.getFile(main);
      	mainImage.write(large.toImage());
	 	var small = Ti.UI.createView({
	 		backgroundImage: mainImage.nativePath,
	 		height:100,
	 		width:100,
	 		borderRadius:50
	 	});
	 	
	 	var tiny = Ti.UI.createImageView({
	 		image: mainImage.nativePath,
	 		height:65,
	 		width:65
	 	});
	 	
	 	
		
		var thumb = Titanium.Filesystem.applicationDataDirectory + "/" + new Date().getTime() + "_thumb.png";
		var map = Titanium.Filesystem.applicationDataDirectory + "/" + new Date().getTime() + "_map.png";
		if(Ti.Platform.displayCaps.density == 'high'){
		map = Titanium.Filesystem.applicationDataDirectory + "/" + new Date().getTime() + "_map@2x.png";
		} else {
			tiny.height = 32;
			tiny.width = 32;
		}
      
     	mainImage = Titanium.Filesystem.getFile(main);
      	mainImage.write(large.toImage());
      	
      	mapImage = Titanium.Filesystem.getFile(map);
      	mapImage.write(tiny.toImage());
      	
      	thumbImage = Titanium.Filesystem.getFile(thumb);
      	thumbImage.write(small.toImage());
      	
      	
			if(!textField.value){
			textField.value = 'Beer # '+Ti.App.Properties.getInt('count');
		}
			var row = Ti.UI.createTableViewRow({
				leftImage:thumbImage.nativePath,
				title:textField.value,
				rightImage:'beer.png',
				userLat:userLat,
				userLon:userLon,
				date:date,
				beer:mainImage.nativePath,
				height:60
			});
			tableView.appendRow(row);
			data.push(row);
			Ti.App.Properties.setString('table',JSON.stringify(data));
			var annotation = Titanium.Map.createAnnotation({
				latitude:userLat,
				longitude:userLon,
				title:textField.value,
	    		subtitle:date,
	    		pincolor:Titanium.Map.ANNOTATION_GREEN,
	    		animate:true,
	    		leftButton: mapImage.nativePath,
	    		beer:mainImage.nativePath
			});
			mapView.addAnnotation(annotation);
			annotations.push(annotation);
			Ti.App.Properties.setString('map',JSON.stringify(annotations));
			//alert(mapView.annotations);
			Titanium.Media.saveToPhotoGallery(large.toImage());
			Ti.Media.hideCamera();
			wait.hide();
			
		},
		cancel:function()
		{
			Ti.Media.hideCamera();
		},
		error:function(error)
		{
			if(Ti.Platform.model == 'Simulator'){
			var row = Ti.UI.createTableViewRow({
				leftImage:'cloverIcon.png',
				title:'test '+Ti.App.Properties.getInt('count'),
				rightImage:'beer.png',
				userLat:userLat,
				userLon:userLon,
				date:date,
				beer:'hat.png',
				height:60
			});
			tableView.appendRow(row);
			data.push(row);
			
			Ti.App.Properties.setString('table',JSON.stringify(data));
			
			var annotation = Titanium.Map.createAnnotation({
				latitude:userLat,
				longitude:userLon,
				title:'test '+count,
	    		subtitle:date,
	    		pincolor:Titanium.Map.ANNOTATION_GREEN,
	    		animate:true,
	    		leftButton: 'cloverIcon.png',
	    		beer:'hat.png'
			});
			mapView.addAnnotation(annotation);
			annotations.push(annotation);
			
			Ti.App.Properties.setString('map',JSON.stringify(annotations));
			
			
			//Titanium.Media.saveToPhotoGallery(large.toImage());
			Ti.Media.hideCamera();
			wait.hide();
			} else {
				var a = Titanium.UI.createAlertDialog({title:'Camera'});
				if (error.code == Titanium.Media.NO_CAMERA)
				{
					a.setMessage('Sorry, you need a camera.');
				}
				else
				{
					a.setMessage('Unexpected error: ' + error.code);
				}
				a.show();
			}
		},
		overlay:view,
		showControls:false,	// don't show system controls
		mediaTypes:Ti.Media.MEDIA_TYPE_PHOTO,
		autohide:true
	});
}

}




//
// create controls tab and root window
//
var win3 = Titanium.UI.createWindow({  
    title:'Friends',
    backgroundColor:color3,
    url:'friend.js',
    barColor:color1,
    color:color3
});
var tab3 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Friends',
    window:win3
});


//
//  add tabs
//
tabGroup.addTab(tab1);  

tabGroup.addTab(tab3); 


// open tab group
tabGroup.open();

