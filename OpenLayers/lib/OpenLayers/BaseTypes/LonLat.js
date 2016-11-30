/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */

/**
 * Class: OpenLayers.LonLat
 * 提供经度纬度对
 */
OpenLayers.LonLat = OpenLayers.Class({

    /** 
     * APIProperty: lon
     * {Float} x轴方向的地图单位坐标
     */
    lon: 0.0,
    
    /** 
     * APIProperty: lat
     * {Float} y轴方向的地图单位坐标
     */
    lat: 0.0,

    /**
     * Constructor: OpenLayers.LonLat
     * 创建一个新的地图点位. 传入的坐标既可以为两个参数也可以为一个数组参数
     *
     * Parameters (两个参数):
     * lon - {Number} x轴方向的地图单位坐标。  如果地图是地理投影，x则代表经度。 
     *     否则，x代表当前地图单位的x轴坐标。
     * lat - {Number} y轴方向的地图单位坐标。  如果地图是地理投影，y则代表纬度 。
     *     否则，y代表当前地图单位的y轴坐标。
     *
     * Parameters (single argument):
     * location - {Array(Float)} [lon, lat]
     */
    initialize: function(lon, lat) {
        if (OpenLayers.Util.isArray(lon)) {
            lat = lon[1];
            lon = lon[0];
        }
        this.lon = OpenLayers.Util.toFloat(lon);
        this.lat = OpenLayers.Util.toFloat(lat);
    },
    
    /**
     * Method: toString
     * 用字符串表示OpenLayers.LonLat 对象
     *
     * Returns:
     * {String} 字符串形式的 OpenLayers.LonLat 对象。 
     *           (e.g. <i>"lon=5,lat=42"</i>)
     */
    toString:function() {
        return ("lon=" + this.lon + ",lat=" + this.lat);
    },

    /** 
     * APIMethod: toShortString
     * 
     * Returns:
     * {String} 缩写形式的字符串表示的 OpenLayers.LonLat 对象。
     *         (e.g. <i>"5, 42"</i>)
     */
    toShortString:function() {
        return (this.lon + ", " + this.lat);
    },

    /** 
     * APIMethod: clone
     * 
     * Returns:
     * {<OpenLayers.LonLat>}  与该对象具有相同 lon &lat 值的OpenLayers.LonLat对象
     */
    clone:function() {
        return new OpenLayers.LonLat(this.lon, this.lat);
    },

    /** 
     * APIMethod: add
     * 改变现有的地图位置
     * 
     * Parameters:
     * lon - {Float}
     * lat - {Float}
     * 
     * Returns:
     * {<OpenLayers.LonLat>} 计算过的新的OpenLayers.LonLat 对象
     */
    add:function(lon, lat) {
        if ( (lon == null) || (lat == null) ) {
            throw new TypeError('LonLat.add cannot receive null values');
        }
        return new OpenLayers.LonLat(this.lon + OpenLayers.Util.toFloat(lon), 
                                     this.lat + OpenLayers.Util.toFloat(lat));
    },

    /** 
     * APIMethod: equals
     * 
     * Parameters:
     * ll - {<OpenLayers.LonLat>}
     * 
     * Returns:
     * {Boolean} 传入对象和当前对象的lon和lat值是否相等的布尔值
     *           注意: 如果传入的ll参数为null，返回false
     */
    equals:function(ll) {
        var equals = false;
        if (ll != null) {
            equals = ((this.lon == ll.lon && this.lat == ll.lat) ||
                      (isNaN(this.lon) && isNaN(this.lat) && isNaN(ll.lon) && isNaN(ll.lat)));
        }
        return equals;
    },

    /**
     * APIMethod: transform
     * 将LonLat 对象从源投影转换为目标投影。 
     *    如果你需要新的LonLat对象，先使用clone() 方法。
     *
     * Parameters: 
     * source - {<OpenLayers.Projection>} 源投影。 
     * dest   - {<OpenLayers.Projection>} 目标投影。 
     *
     * Returns:
     * {<OpenLayers.LonLat>} 对象本身，用于链式调用。
     */
    transform: function(source, dest) {
        var point = OpenLayers.Projection.transform(
            {'x': this.lon, 'y': this.lat}, source, dest);
        this.lon = point.x;
        this.lat = point.y;
        return this;
    },
    
    /**
     * APIMethod: wrapDateLine
     * 
     * Parameters:
     * maxExtent - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {<OpenLayers.LonLat>} 该lonlat对象的一份拷贝??
     */
    wrapDateLine: function(maxExtent) {    

        var newLonLat = this.clone();
    
        if (maxExtent) {
            //shift right?
            while (newLonLat.lon < maxExtent.left) {
                newLonLat.lon +=  maxExtent.getWidth();
            }    
           
            //shift left?
            while (newLonLat.lon > maxExtent.right) {
                newLonLat.lon -= maxExtent.getWidth();
            }    
        }
                
        return newLonLat;
    },

    CLASS_NAME: "OpenLayers.LonLat"
});

/** 
 * Function: fromString
 * 可替代构造函数，通过字符串参数创建一个新的OpenLayers.LonLat对象 
 * 
 * Parameters:
 * str - {String} 逗号分隔的表示 Lon,Lat 坐标值得字符串。 
 *                 (e.g. <i>"5,40"</i>)
 * 
 * Returns:
 * {<OpenLayers.LonLat>} 根据传入的字符串参数新建的OpenLayers.LonLat对象
 */
OpenLayers.LonLat.fromString = function(str) {
    var pair = str.split(",");
    return new OpenLayers.LonLat(pair[0], pair[1]);
};

/** 
 * Function: fromArray
 * 可替代构造函数，通过数组参数创建一个新的OpenLayers.LonLat对象 
 * 
 * Parameters:
 * arr - {Array(Float)} 包括 lon/lat值的数组(e.g. [5,-42])
 * 
 * Returns:
 * {<OpenLayers.LonLat>} 根据传入的数组参数新建的OpenLayers.LonLat对象
 */
OpenLayers.LonLat.fromArray = function(arr) {
    var gotArr = OpenLayers.Util.isArray(arr),
        lon = gotArr && arr[0],
        lat = gotArr && arr[1];
    return new OpenLayers.LonLat(lon, lat);
};
