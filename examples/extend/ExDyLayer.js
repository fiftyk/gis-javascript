/**
 * ExDyLayer类
 * @author 许照云
 * 2013.5
 */
OpenLayers.Layer.ExDyLayer = OpenLayers.Class(OpenLayers.Layer.Grid,{
	
	tileSize:new OpenLayers.Size(256,256),
    tileOrigin:null,
    gutter:15,
//    isBaseLayer: true,
    wrapDateLine: true,
	
//	singleTile: true,
//    ratio: 1,
//    isBaseLayer: true,
//    wrapDateLine: true,
    
    
    url:null,

    inSR:'102113',
    outSR:'102113',
    
    /**
     * APIProperty: features
     * {array} 二维数组
     */
    features:[],
	
	/**
     * APIProperty: vectorLayer
     * {OpenLayers.Layer.Vector} 附属的矢量图层
     */
	vectorLayer:new OpenLayers.Layer.Vector('动态图层附属矢量图层'),

	
	/**
     * Constructor: OpenLayers.Layer.XYZ
     *
     * Parameters:
     * name - {String}
     * url - {String}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, options) {
    	OpenLayers.Layer.Grid.prototype.initialize.apply(this, [
            name || this.name, url || this.url, {}, options
        ]);	
    },
	
	/**
     * Method: getURL
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *          passed-in bounds and appropriate tile size specified as
     *          parameters
     */
	getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        var bbox = bounds.left + "," + bounds.bottom + "," + bounds.right + "," + bounds.top;
        var size = this.getImageSize();
        //疑问：坐标系问题？
        
        
        //拼接从后台地图服务获取动态图片的url
        var exportUrl = this.url + "export?bbox=" + bbox + "&size=" 
        					+ size.w + "," + size.h 
        					+ "&inSR=" + this.inSR + "&outSR=" + this.outSR;
        
        
        //拼接从后台获取json数据的url，利用ajax请求json数据        
//        var	queryUrl ='MapProxyServ?url='
//        	+ (this.url + 'query').replace('http://', '')+"?bbox=" + bbox + "&size=" 
//			+ size.w + "," + size.h 
//			+ "&inSR=" + this.inSR + "&outSR=" + this.outSR;

//        console.log(queryUrl);  
        
        
        if(this.features.length == 0){//确保只请求一次数据     	
        	$.getJSON('../query.json',$.proxy(function(data){

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
	                
//	                pnt.transform("EPSG:4326", "EPSG:102113");
	                if(xy[0] === 0 || xy[1] === 0){
	                        continue;
	                 }
	                
	                for(var j = 0;j < fields.length;j++){
	                    var field = fields[j];
	                    attributes[field] = record[j];
	                }

	                
	                this.features.push([pnt,attributes]);
	            }
	            
            },this));
        }
        
        return exportUrl;
    },
    
    /**
     * Method: selectFeatures（及query方法，查询该动态图层中在指定多边形内的点位）
     * 将查询出的点位添加到该动态图层的矢量图层上  addFeatures
     * Parameters:
     * polygon  {OpenLayers.Geometry.Polygon}
     */
    selectFeatures:function(polygon,callback){
    	this.vectorLayer.removeAllFeatures();
    	var ftNum = 0;
    	
    	for(var i=0;i<this.features.length;i++){
    		if(polygon.containsPoint(this.features[i][0])){
    			
    			var feature = new OpenLayers.Feature.Vector(this.features[i][0],this.features[i][1]);
    			feature.layer = this.vectorLayer;
    			callback(feature);
    			
    			ftNum = ftNum+1;
    			this.vectorLayer.addFeatures([feature]);
    		}else{
    			continue;
    		}
    		
    		if(ftNum > 100){//控制渲染的点数
    			alert("选择的点数超过100");
    			return
    		}
    	}
    	
    },
	
	
	
	CLASS_NAME: "OpenLayers.Layer.ExDyLayer"
});









