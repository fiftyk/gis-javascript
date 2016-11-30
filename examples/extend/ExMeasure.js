/**
 * ExMeasure类
 * @author 许照云
 * 2013.5
 * 
 * 使用示例：
	//测距
	var MeasurePath = new ExMeasure(1);
	var MeasurePathCtl = MeasurePath.getCtl();
	//测面
	var MeasurePolygon = new ExMeasure(2)
	var MeasurePolygonCtl =MeasurePolygon.getCtl();
	
	control_panel.addControls([MeasurePathCtl,MeasurePolygonCtl]);
	MeasurePath.setStyle();
	var callback = function(){
		console.log(2);
	};
	MeasurePath.addCallback(callback);

 */
function ExMeasure(type){
	
	//定义量测控件样式
	this.sketchSymbolizers = {
		    "Point": {
		        pointRadius: 4,
		        graphicName: "circle",
		        fillColor: "white",
		        fillOpacity: 1,
		        strokeWidth: 1,
		        strokeOpacity: 1,
		        strokeColor: "red"
		    },
		    "Line": {
		        strokeWidth: 2,
		        strokeOpacity: 1,
		        strokeColor: "red",
		        strokeDashstyle: "dash"
		    },
		    "Polygon": {
		        strokeWidth: 2,
		        strokeOpacity: 1,
		        strokeColor: "red",
		        fillColor: "orange",
		        fillOpacity: 0.3
		    }
	};

	var style = new OpenLayers.Style();
	style.addRules([
	    new OpenLayers.Rule({symbolizer: this.sketchSymbolizers})
	]);
	
	this.styleMap = new OpenLayers.StyleMap({"default": style});
	
	
	this.myHandler = null;
	this.suffix = null;
	
	if(type == 1){
		this.myHandler = OpenLayers.Handler.Path;
		this.suffix = '';
	}else{
		this.myHandler = OpenLayers.Handler.Polygon;
		this.suffix = '2';//暂且表示平方
	}
	
	var self = this;
	this.ctl = new OpenLayers.Control.Measure(self.myHandler,{
		callbacks:null,
        persist:true,
        measure_pop_array:[],//存储测量时所有弹出的popup
        handlerOptions: {
                layerOptions: {
                    styleMap: this.styleMap
                }
            },
        eventListeners:{
            measure:function(){
                out = "总计: " + arguments[0].measure.toFixed(1) + " " + arguments[0].units+ self.suffix;
                if (arguments[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
                    var points = arguments[0].geometry.components[0].components;
                    var n = points.length - 1;
                }
                else if(arguments[0].geometry.CLASS_NAME == "OpenLayers.Geometry.LineString"){
                    var points = arguments[0].geometry.components;
                    var n = points.length;
                };
                
                var map = this.map;
                var myself = this;
//                console.log(map);
                popup1= new OpenLayers.Popup(n-1,
                    new OpenLayers.LonLat(points[n-1].x, points[n-1].y),
                    new OpenLayers.Size(120,15),
                    out,
                    true,
                    function(){
                        for(var i = 0; i<popup_len; i++){
                            map.removePopup(myself.measure_pop_array[i]);
                        };
                        myself.handler.destroyPersistedFeature();
                        myself.measure_pop_array = [];//置空
                    });
//                popup1.setOpacity(0.5);
                map.addPopup(popup1);
                this.measure_pop_array.push(popup1);
                var popup_len = this.measure_pop_array.length;  //以防有时popup来不及创建造成的错误
            },
            measurepartial:function(){ 
                if (arguments[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
                    var points = arguments[0].geometry.components[0].components;
                }
                else if(arguments[0].geometry.CLASS_NAME == "OpenLayers.Geometry.LineString"){
                    var points = arguments[0].geometry.components;
                };

                if(points.length == 2 && arguments[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
                    var n = points.length - 1;
                }else if(points.length > 2 && arguments[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
                    var n = points.length - 2;
                }else{
                    var n = points.length;
                };
                
                if (arguments[0].measure == 0){
                    out = "起点";
                    var popup_len = this.measure_pop_array.length;  //以防有时popup来不及创建造成的错误
                    for(var i = 0; i<popup_len; i++){
                        map.removePopup(this.measure_pop_array[i]);
                    };
                    
                    var popup1= new OpenLayers.Popup(n-1,
                    new OpenLayers.LonLat(points[n-1].x, points[n-1].y),
                    new OpenLayers.Size(50,15),
                    out,
                    false);
                }
                else{
                    out = arguments[0].measure.toFixed(1) + " " + arguments[0].units+self.suffix;
                    var popup1= new OpenLayers.Popup(n-1,
                    new OpenLayers.LonLat(points[n-1].x, points[n-1].y),
                    new OpenLayers.Size(80,15),
                    out,
                    false);                 
                }
                this.measure_pop_array.push(popup1);
                map.addPopup(popup1);
            },
            deactivate:function(){
            	 var popup_len = this.measure_pop_array.length;  //以防有时popup来不及创建造成的错误
                 for(var i = 0; i<popup_len; i++){
                     map.removePopup(this.measure_pop_array[i]);
                 };
            }
        }
    });
	
	this.setStyle = function(style){
		this.sketchSymbolizers = style;
	};
	
	this.addCallback = function(callback){
		console.log(this.ctl.callbacks);
		this.ctl.callbacks = callback;
	};
	
	this.getCtl = function(){
		return this.ctl;
	};
	
};
