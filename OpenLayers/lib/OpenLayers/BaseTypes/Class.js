/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/SingleFile.js
 */

/**
 * Constructor: OpenLayers.Class
 * 构建所有其它类的基础类. 支持多重继承. 
 *     
 * This constructor is new in OpenLayers 2.5.  At OpenLayers 3.0, the old 
 *     syntax for creating classes and dealing with inheritance 
 *     will be removed.
 * 
 * 创建一个新的OpenLayers风格的类, 使用下面的句法:
 * (code)
 *     var MyClass = OpenLayers.Class(prototype);
 * (end)
 *
 * 创建一个新的多重继承的OpenLayers风格的类, 使用下面的句法:
 * (code)
 *     var MyClass = OpenLayers.Class(Class1, Class2, prototype);
 * (end)
 * 
 * 注意对MyClass使用 instanceof 时,将只识别 Class1 为父类.
 *
 */
OpenLayers.Class = function() {
    var len = arguments.length;
    var P = arguments[0];//第1个参数(Class1)
    var F = arguments[len-1];//最后1个参数(prototype)

    var C = typeof F.initialize == "function" ?
        F.initialize ://如果prototype未指定initialize方法则使用父类Class1的?
        function(){ P.prototype.initialize.apply(this, arguments); };

    if (len > 1) {//将Class1, Class2, prototype的所有属性都复制到C
        var newArgs = [C, P].concat(
                Array.prototype.slice.call(arguments).slice(1, len-1), F);
        OpenLayers.inherit.apply(null, newArgs);
    } else {
        C.prototype = F;
    }
    return C;
};

/**
 * Function: OpenLayers.inherit
 *
 * Parameters:
 * C - {Object} 子类
 * P - {Object} 父类
 *
 * C 和 P 参数必须,除此之外,任意数量的对象都可以被传递进来,用于扩展C.
 */
OpenLayers.inherit = function(C, P) {
   var F = function() {};
   F.prototype = P.prototype;
   C.prototype = new F;
   var i, l, o;
   for(i=2, l=arguments.length; i<l; i++) {
       o = arguments[i];
       if(typeof o === "function") {
           o = o.prototype;
       }
       OpenLayers.Util.extend(C.prototype, o);
   }
};

/**
 * APIFunction: extend
 * 从源对象复制所有的属性到目标对象.目标对象原有的对象将被更新. 源对象中所有值为 
 * undefined 的属性不会被设置到目标对象上.
 *
 * Parameters:
 * destination - {Object} 将被修改的目标对象
 * source - {Object} 源对象
 *
 * Returns:
 * {Object} 目标对象.
 */
OpenLayers.Util = OpenLayers.Util || {};
OpenLayers.Util.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }

        /**
         * 在IE中使用for(property in object)语法遍历一个对象的属性(方法也是属性)
         * 时,不会包含toString属性. 对此情况我们要做检查.
         */

        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object
         * is an instance of window.Event.
         */

        var sourceIsEvt = typeof window.Event == "function"
                          && source instanceof window.Event;

        if (!sourceIsEvt//调用hawOwnProperty之前,先判断可不可以调用
           && source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};
