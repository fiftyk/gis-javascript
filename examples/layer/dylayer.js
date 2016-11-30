
var streetLayer =
    new OpenLayers.Layer.GMapLayer("Google路况图层",
        [ "http://mt0.google.com/vt?lyrs=m@205000000,"
            + "traffic|seconds_into_week:-1" ],{isBaseLayer:true})

MAP_SR = '102113'
var url = "http://172.16.60.32:6666/rest/igate_tz/1/";
var dylayer = new OpenLayers.Layer.ExDyLayer('动态图层', url);

var map = new OpenLayers.Map("map",{
	layers:[dylayer,streetLayer],
	center:new OpenLayers.LonLat(13480179, 3773368),
	numZoomLevels: 22,
    zoom: 5,
	projection: "EPSG:102113"
});
map.zoomToExtent([13460179, 3763368, 13496563, 3780337]);

map.addControl(new OpenLayers.Control.LayerSwitcher());

vlayer = dylayer.vectorLayer
//console.log(dylayer.vectorLayer);

var sfctl = new OpenLayers.Control.ExSelectFeature(dylayer.vectorLayer, {
	types:[-1,0,1,3],
	multiple : false,
    toggle : true,
    persist : true,
    onPolygonDone : function(geometry) {
//    	var polygonPoints = [];
//    	var pointGeom = geometry.components[0].components;
//    	for(var i=0;i<pointGeom.length;i++){
//    		polygonPoints.push([pointGeom[i].x,pointGeom[i].y]);
//    	}

    	dylayer.selectFeatures(geometry,function(feature){
    		sfctl.select(feature);
    	});
    },
    onSelect : function(feature) {
        console.log(feature);
    },
});

map.addControl(sfctl);
sfctl.ul.show();

map.addLayers([dylayer.vectorLayer]);








































//'----------------------以下转换矢量点位数据-------------------------------------------'
//var transData = function(data){
//	var vectors = [];
//	
//    var fields = data.fields,
//        type = data.type,
//        records = data.features,
//        len = records.length,
//        i;
//
//    for(i = 0;i < len;i++){
//        var record = records[i],
//            xy = record[0],
//            pnt = new OpenLayers.Geometry.Point(xy[0],xy[1]),
//            attributes = {};
//            
//        if(xy[0] === 0 || xy[1] === 0){
//                continue;
//            }
//        
//        for(var j = 0;j < fields.length;j++){
//            var field = fields[j];
//            attributes[field] = record[j];
//        }
//        //过滤JKLX！='ZAJK'
//        if(attributes['JKLX'] != 'ZAJK'){
//            continue;
//        }
//            
//        var vector = new OpenLayers.Feature.Vector(pnt,attributes);
//        vectors.push(vector);
//    }
//    return vectors;
//};
//'----------------------以上转换矢量点位数据-------------------------------------------'
//'----------------------以下实例化图层 ----------------------------------------------'
////动态图层（栅格图层）
//var dylayer = new OpenLayers.Layer.YhDyLayer("动态图层",
//		"http://172.16.60.32:6666/rest/igate_tz/1/",{opacity:1});
//
////pgis图层（栅格图层）
//var pgislayer = new OpenLayers.Layer.PGisLayer("无锡市矢量图层",
//        ["http://172.16.60.32:6666/rest/pub/2/tiles"],
//        {zoomOffset:4});
//
////gmap图层（栅格图层）
//var streetLayer =
//    new OpenLayers.Layer.GMapLayer("Google路况图层",
//        [ "http://mt0.google.com/vt?lyrs=m@205000000,"
//            + "traffic|seconds_into_week:-1" ],{isBaseLayer:true})
//
////矢量图层
//var vector_layer = new OpenLayers.Layer.Vector('矢量点位'); 
//var vectors = transData(data);
//vector_layer.addFeatures(vectors);
//'----------------------以上实例化图层 ---------------------------------------------'

//map = new OpenLayers.Map("map",{
//    layers:[dylayer,streetLayer,vector_layer],
//    center:new OpenLayers.LonLat(13480179, 3773368),
//});
//
//map.addControl(new OpenLayers.Control.LayerSwitcher());


//'----------------------以下测试加载矢量图层控制要素显示与否的效率比较----------------------------'
//var st = new Date().getTime();
//var baselayer = new OpenLayers.Layer.Vector('比较效率',{
//	isBaseLayer:true	
//}); 
//
//var compare_layer = new OpenLayers.Layer.Vector('比较效率'); 
//var allVectors = [];
//var style = OpenLayers.Util.extend(
//		OpenLayers.Feature.Vector.style['default'], {
//						graphic : false
//});
//for(var i=0;i<50;i++){
//	var vector = new OpenLayers.Feature.Vector(
//			new OpenLayers.Geometry.Point(0,0),{},style);
//	allVectors.push(vector);
//};
//
//compare_layer.addFeatures(allVectors);
//var map = new OpenLayers.Map("map",{
//    layers:[baselayer,compare_layer],
//    center:new OpenLayers.LonLat(0, 0)
//});
//
//var st2 = new Date().getTime() - st;
//alert(st2);
//'----------------------以上测试加载矢量图层控制要素显示与否的效率比较----------------------------'

