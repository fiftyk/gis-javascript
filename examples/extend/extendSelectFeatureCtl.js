/**
 * setLocation(区域代码,坐标系(GMAP、PGIS))
 */

var transData = function(data){
	var vectors = [];
	
    var fields = data.fields,
        type = data.type,
        records = data.features,
        len = records.length,
        i;

    for(i = 0;i < len;i++){
        var record = records[i],
            xy = record[0],
            pnt = new OpenLayers.Geometry.Point(xy[0],xy[1]),
            attributes = {};
            
        if(xy[0] === 0 || xy[1] === 0){
                continue;
            }
        
        for(var j = 0;j < fields.length;j++){
            var field = fields[j];
            attributes[field] = record[j];
        }
        //过滤JKLX！='ZAJK'
        if(attributes['JKLX'] != 'ZAJK'){
            continue;
        }
            
        var vector = new OpenLayers.Feature.Vector(pnt,attributes);
        vectors.push(vector);
    }
    return vectors;
};

GeoSetup.setLocation("320683","GMAP");
var MAP_EXTENT = GeoSetup.getExtent();
var MAP_SR = GeoSetup.getSR();

var control_panel = new OpenLayers.Control.ExPanel({});

var mapMod = $('#map').mapModule({
    mapUrl : "street",  //"pgis@http://172.16.64.24:8888/tiles",
    layerUrl:"http://172.16.60.32:6666/rest/igate_tz/1/",
    extent : MAP_EXTENT,
    sides : 40,
    panel:control_panel

}); 


var vectors = transData(data);
mapMod.addFeatures(vectors);




'--------------------以下代码用于获取坐标点位--------------------------------------'
var vector_layer = mapMod.getLayers();
var map = mapMod.getMap();

var ToDoWithFtGeometry = function(geometry){
//	console.log(geometry);
	//用户希望根据在地图上获取的坐标值进行的处理
};
var onFeatureAdded = function(feature) {//该方法能否有返回值return？？如何实现？
	var layer = feature.layer;  
	var geometry = feature.geometry;
	layer.removeFeatures([feature]);
	var point_temp_style = OpenLayers.Util.extend({},
            OpenLayers.Feature.Vector.style['default']);
	var ftStyle = OpenLayers.Util.extend(point_temp_style, {
    	fillOpacity: 0.2,  
    	strokeColor: "red",
    	strokeWidth: 2,
    });
	var newFeature = new OpenLayers.Feature.Vector(geometry,{},ftStyle);
	layer.addFeatures([newFeature]);
	
	ToDoWithFtGeometry(feature.geometry);
};
// 增加绘制点要素的控件
var drawPointCtl =
    new OpenLayers.Control.DrawFeature(vector_layer,
        OpenLayers.Handler.Point, {  	    
    	    displayClass: 'olControlDrawPoint',
    		text: 'Draw',
            featureAdded : onFeatureAdded
        });
//增加绘制线要素的控件
var drawLineCtl =
    new OpenLayers.Control.DrawFeature(vector_layer,
        OpenLayers.Handler.Path, {
    	    displayClass: 'olControlDrawLine',
//    		text: 'Draw',
            featureAdded : onFeatureAdded
        });
//增加绘制多边形要素的控件
var drawPolygonCtl =
    new OpenLayers.Control.DrawFeature(vector_layer,
        OpenLayers.Handler.Polygon, {
    	    displayClass: 'olControlDrawPolygon',
//    		text: 'Draw',
            featureAdded : onFeatureAdded
        });

control_panel.addControls([drawPointCtl,drawLineCtl,drawPolygonCtl]);
'--------------------以上代码用于获取坐标点位--------------------------------------'

map.addControl(control_panel);
control_panel.moveTo(new OpenLayers.Pixel(10,80)); //移动panel在地图中的位置

$('#isPersist').click(function(){
	if($(this).attr('checked')){
		mapMod.getSelector().setPersist(true);
	}else{
		mapMod.getSelector().setPersist(false);
	}
	
});
$('#isContinous').click(function(){
	if($(this).attr('checked')){
		mapMod.getSelector().setContinous(true);
	}else{
		mapMod.getSelector().setContinous(false);
	}
});
$('#isMultiple').click(function(){
	if($(this).attr('checked')){
		mapMod.getSelector().setMultiple(true);
	}else{
		mapMod.getSelector().setMultiple(false);
	}
});




