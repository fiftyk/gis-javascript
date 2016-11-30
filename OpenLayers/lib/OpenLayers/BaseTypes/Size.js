/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */

/**
 * Class: OpenLayers.Size
 * 表示宽和高的类
 */
OpenLayers.Size = OpenLayers.Class({

    /**
     * APIProperty: w
     * {Number} 宽度
     */
    w: 0.0,
    
    /**
     * APIProperty: h
     * {Number} 高度
     */
    h: 0.0,


    /**
     * Constructor: OpenLayers.Size
     * Create an instance of OpenLayers.Size
     *
     * Parameters:
     * w - {Number} width
     * h - {Number} height
     */
    initialize: function(w, h) {
        this.w = parseFloat(w);
        this.h = parseFloat(h);
    },

    /**
     * Method: toString
     * 用字符串表示size对象
     *
     * Returns:
     * {String} 字符串表示的OpenLayers.Size对象。 
     * (e.g. <i>"w=55,h=66"</i>)
     */
    toString:function() {
        return ("w=" + this.w + ",h=" + this.h);
    },

    /**
     * APIMethod: clone
     * 拷贝size对象
     *
     * Returns:
     * {<OpenLayers.Size>} 当前对象的拷贝
     * values
     */
    clone:function() {
        return new OpenLayers.Size(this.w, this.h);
    },

    /**
     *
     * APIMethod: equals
     * 判断两个size对象是否相同
     *
     * Parameters:
     * sz - {<OpenLayers.Size>|Object} 一个OpenLayers.Size对象或者有'w' and 'h'属性的对象
     *
     * Returns: 
     * {Boolean} 两个size对象是否相同。
     * 注意如果传入参数时null，返回false。
     */
    equals:function(sz) {
        var equals = false;
        if (sz != null) {
            equals = ((this.w == sz.w && this.h == sz.h) ||
                      (isNaN(this.w) && isNaN(this.h) && isNaN(sz.w) && isNaN(sz.h)));
        }
        return equals;
    },

    CLASS_NAME: "OpenLayers.Size"
});
