/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 * 依赖 OpenLayers/BaseTypes/Class.js
 */

/**
 * Class: OpenLayers.Pixel
 * 屏幕坐标用x、y表示像素位置
 */
OpenLayers.Pixel = OpenLayers.Class({
    
    /**
     * APIProperty: x
     * {Number} The x coordinate
     */
    x: 0.0,

    /**
     * APIProperty: y
     * {Number} The y coordinate
     */
    y: 0.0,
    
    /**
     * Constructor: OpenLayers.Pixel
     * 创建 OpenLayers.Pixel 实例
     *
     * Parameters:
     * x - {Number} The x coordinate
     * y - {Number} The y coordinate
     *
     * Returns:
     * OpenLayers.Pixel 实例
     */
    initialize: function(x, y) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    },
    
    /**
     * Method: toString
     * 将对象转换为字符串
     *
     * Returns:
     * {String} 字符串形式表示的 Pixel. ex: "x=200.4,y=242.2"
     */
    toString:function() {
        return ("x=" + this.x + ",y=" + this.y);
    },

    /**
     * APIMethod: clone
     * 拷贝像素对象
     *
     * Returns:
     * {<OpenLayers.Pixel>} A clone pixel
     */
    clone:function() {
        return new OpenLayers.Pixel(this.x, this.y); 
    },
    
    /**
     * APIMethod: equals
     * 判断两个像素对象是否相等
     *
     * Parameters:
     * px - {<OpenLayers.Pixel>|Object} 一个 OpenLayers.Pixel 对象或者是带有'x' 和 'y'属性的对象
     *
     * Returns:
     * {Boolean} 传入的点是否与this对象相等。
     * 如果传入的参数时null，返回false。
     */
    equals:function(px) {
        var equals = false;
        if (px != null) {
            equals = ((this.x == px.x && this.y == px.y) ||
                      (isNaN(this.x) && isNaN(this.y) && isNaN(px.x) && isNaN(px.y)));
        }
        return equals;
    },

    /**
     * APIMethod: distanceTo
     * 返回该对象与传入参数的点的距离
     *
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     *
     * Returns:
     * {Float} 当前对象与传入像素参数的距离
     */
    distanceTo:function(px) {
        return Math.sqrt(
            Math.pow(this.x - px.x, 2) +
            Math.pow(this.y - px.y, 2)
        );
    },

    /**
     * APIMethod: add
     *
     * Parameters:
     * x - {Integer}
     * y - {Integer}
     *
     * Returns:
     * {<OpenLayers.Pixel>} 根据传入的参数的x&y属性计算得到的新的像素坐标
     */
    add:function(x, y) {
        if ( (x == null) || (y == null) ) {
            throw new TypeError('Pixel.add cannot receive null values');
        }
        return new OpenLayers.Pixel(this.x + x, this.y + y);
    },

    /**
    * APIMethod: offset
    * 
    * 偏移像素坐标
    * Parameters
    * px - {<OpenLayers.Pixel>|Object} 一个 OpenLayers.Pixel 对象或者是一个带有'x' 和 'y'属性的对象
    * 
    * Returns:
    * {<OpenLayers.Pixel>} 根据传入的参数的x&y属性计算得到的新的像素坐标
    */
    offset:function(px) {
        var newPx = this.clone();
        if (px) {
            newPx = this.add(px.x, px.y);
        }
        return newPx;
    },

    CLASS_NAME: "OpenLayers.Pixel"
});
