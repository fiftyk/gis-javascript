/**
 * setLocation(区域代码,坐标系(GMAP、PGIS))
 */
'----------------------以下转换矢量点位数据-------------------------------------------'
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

'----------------------以下地图基本配置-------------------------------------------'
GeoSetup.setLocation("320683","GMAP");
var MAP_EXTENT = GeoSetup.getExtent();
var MAP_SR = GeoSetup.getSR();

var control_panel = new OpenLayers.Control.ExPanel({});

var mapMod = $('#map').mapModule({
    mapUrl : "street",  //"pgis@http://172.16.64.24:8888/tiles",
    layerUrl:"http://172.16.60.32:6666/rest/igate_tz/1/",
    extent : MAP_EXTENT,
    sides : 40,
//    default_graphic:'none',
//    select_graphic:'none',
    panel:control_panel

}); 


var vectors = transData(data);
mapMod.addFeatures(vectors);

var vector_layer = mapMod.getLayers();
var map = mapMod.getMap();

'----------------------以下ExSelectFeature配置参数测试使用--------------------------'
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

'----------------------以下加载获取要素坐标控件--------------------------'

var showcdt = function(){
	console.log(arguments);
};

var GetCdtCtl = new OpenLayers.Control.GetCoordinate(vector_layer,{
	types:[1,2,3],
	persist:false,
//	callback:function(){
//		console.log(arguments);
//	}
});


GetCdtCtl.addCallback(showcdt);

control_panel.addControls([GetCdtCtl]);
map.addControl(control_panel);
control_panel.moveTo(new OpenLayers.Pixel(10,80)); //移动panel在地图中的位置

//map.addControl(GetCdtCtl);
//GetCdtCtl.ul.show();


'----------------------以下模拟轨迹回放的原始数据--------------------------'
var pts = vectors.splice(2,4); //获取点要素的数据
//作为底图
var points_geo = [];
for(var i=0;i<pts.length;i++){
	points_geo.push(pts[i].geometry);
}
var path = new OpenLayers.Geometry.LineString(points_geo);
var path_ft = new OpenLayers.Feature.Vector(path);
vector_layer.addFeatures(path_ft);

//组织数据格式
var xypts = [];
for(var i=0;i<pts.length;i++){
	xypts.push([pts[i].geometry.x,pts[i].geometry.y]);   //模拟轨迹点位，数据类型转换，类型为ol.geometry.point
}

//用于坐标转换(不适用transform进行坐标转换)
var llxypts = [];
for(var i=0;i<xypts.length;i++){
	var ll = OpenLayers.LinearFunc.toLL(xypts[i][0],xypts[i][1]);
	llxypts.push(ll);
}
console.log(llxypts);
'----------------------以下加载轨迹回放控件--------------------------'


var geographic = new OpenLayers.Projection("EPSG:4326");
var mercator =  new OpenLayers.Projection("EPSG:102113");

var PathTrackCtl = new OpenLayers.Control.PathTrack(vector_layer,{
	end:function(){
//		vector_layer.removeFeatures(vertexFts);
		console.log("结束到终点");
		console.log(arguments);	
	}
});

control_panel.addControls([PathTrackCtl]);

var vertexFts = [];

PathTrackCtl.afterForward = function(){
	if(arguments[2]){//节点编号，非关键节点则为0
		if(arguments[2] == 1){
			vector_layer.removeFeatures(vertexFts);
		}
		
		if(MAP_SR == "102113"){
			arguments[0].geometry.transform(geographic,mercator);
		}
		var vertexStyle = OpenLayers.Util.extend(
				OpenLayers.Util.extend({},
						OpenLayers.Feature.Vector.style['default']), 
				{
					fillOpacity: 0,  
					strokeColor: "green",
					strokeWidth: 2,
					fillColor:"green",
					pointRadius:10,
					label:arguments[2].toString()	
				});
		var vertexFt = new OpenLayers.Feature.Vector(arguments[0].geometry,{},vertexStyle);
		vector_layer.addFeatures([vertexFt]);
		vertexFts.push(vertexFt);
	}	
};


PathTrackCtl.setSourceData(llxypts);
//PathTrackCtl.activate(1);

//PathTrackCtl.ul.show();

'----------------------以下加载量测控件--------------------------'

var MeasureCtl = new OpenLayers.Control.ExMeasure({
	types:[1,2]
});
control_panel.addControls([MeasureCtl]);
var callback = function(){
	console.log(arguments);
};
MeasureCtl.addCallback(callback);
//MeasureCtl.setPopupBackgroundColor('#FFFFBB');
//MeasureCtl.setPopupOpacity(1);



////测距
//var MeasurePath = new ExMeasure(1);
//var MeasurePathCtl = MeasurePath.getCtl();
////测面
//var MeasurePolygon = new ExMeasure(2)
//var MeasurePolygonCtl =MeasurePolygon.getCtl();
//
//control_panel.addControls([MeasurePathCtl,MeasurePolygonCtl]);
//MeasurePath.setStyle();
//var callback = function(){
//	console.log(2);
//};
//MeasurePath.addCallback(callback);

