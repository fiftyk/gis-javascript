/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */

/**
 * 类: OpenLayers.Bounds
 * 该类的实例表现一个边界范围。数据存储为left, bottom, right, top。 所有值
 * 初始化时被设置为null,因此,在使用前请确认已经设置了这些值.
 * 
 * 示例:
 * (code)
 *     bounds = new OpenLayers.Bounds();
 *     bounds.extend(new OpenLayers.LonLat(4,5));
 *     bounds.extend(new OpenLayers.LonLat(5,6));
 *     bounds.toBBOX(); // returns 4,5,5,6
 * (end)
 */
OpenLayers.Bounds = OpenLayers.Class({

    /**
     * Property: left
     * {Number} 水平方向最小坐标值.
     */
    left: null,

    /**
     * Property: bottom
     * {Number} 垂直方向最小坐标值.
     */
    bottom: null,

    /**
     * Property: right
     * {Number} 水平方向最大坐标值.
     */
    right: null,

    /**
     * Property: top
     * {Number} 垂直方向最大坐标值.
     */
    top: null,
    
    /**
     * Property: centerLonLat
     * {<OpenLayers.LonLat>} 中心位置缓存值。
     * 不应直接访问使用 getCenterLonLat方法访问。
     * <getCenterLonLat> .
     */
    centerLonLat: null,

    /**
     * Constructor: OpenLayers.Bounds
     * 创建一个 bounds 对象。参数可以是4个值, 或者一个包含4个值的数组.
     *
     * Parameters (4 参数):
     * left - {Number} 左边界。用于 width 计算, 所以被假定小于 right 值.
     * bottom - {Number} 底边界。用于 height 计算, 所以被假定小于 top 值.
     * right - {Number} 右边界。
     * top - {Number} 顶边界。
     *
     * Parameters (1 参数):
     * bounds - {Array(Number)} [left, bottom, right, top]
     */
    initialize: function(left, bottom, right, top) {
        if (OpenLayers.Util.isArray(left)) {
            top = left[3];
            right = left[2];
            bottom = left[1];
            left = left[0];
        }
        if (left != null) {
            this.left = OpenLayers.Util.toFloat(left);
        }
        if (bottom != null) {
            this.bottom = OpenLayers.Util.toFloat(bottom);
        }
        if (right != null) {
            this.right = OpenLayers.Util.toFloat(right);
        }
        if (top != null) {
            this.top = OpenLayers.Util.toFloat(top);
        }
    },

    /**
     * Method: clone
     * 创建该 bounds 的克隆对象.
     *
     * Returns:
     * {<OpenLayers.Bounds>} 该 bounds 对象的克隆
     */
    clone:function() {
        return new OpenLayers.Bounds(this.left, this.bottom, 
                                     this.right, this.top);
    },

    /**
     * Method: equals
     * 判断两 bounds 是否相等.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {Boolean} 传入的bounds对象的四个属性如果和this对象的一致，equals赋值为tuue，
        否则赋值false。 如果传入的bounds对象为空，返回false。
     */
    equals:function(bounds) {
        var equals = false;
        if (bounds != null) {
            equals = ((this.left == bounds.left) && 
                      (this.right == bounds.right) &&
                      (this.top == bounds.top) && 
                      (this.bottom == bounds.bottom));
        }
        return equals;
    },

    /** 
     * APIMethod: toString
     * 将对象属性转换为字符串描述
     * Returns:
     * {String} bounds 对象的字符串描述. 
     */
    toString:function() {
        return [this.left, this.bottom, this.right, this.top].join(",");
    },

    /**
     * APIMethod: toArray
     * 将对象属性转换为数组描述
     * Parameters:
     * reverseAxisOrder - {Boolean} 是否需要旋转[bottom, left, top, right]中四个元素的顺序
     *
     * Returns:
     * {Array} 数组 [left, bottom, right, top]或者[left, bottom, right, top]
     */
    toArray: function(reverseAxisOrder) {
        if (reverseAxisOrder === true) {
            return [this.bottom, this.left, this.top, this.right];
        } else {
            return [this.left, this.bottom, this.right, this.top];
        }
    },    

    /** 
     * APIMethod: toBBOX
     * 
     * Parameters:
     * decimal - {Integer} bbox 坐标保留几位有效数字? 默认: 6
     * reverseAxisOrder - {Boolean} 是否需要旋转[bottom, left, top, right]中四个元素的顺序?
     * 
     * Returns:
     * {String} bounds 对象的简单字符串描述.
     *          (e.g. <i>"5,42,10,45"</i>)
     */
    toBBOX:function(decimal, reverseAxisOrder) {
        if (decimal== null) {
            decimal = 6; 
        }
        var mult = Math.pow(10, decimal);
        var xmin = Math.round(this.left * mult) / mult;
        var ymin = Math.round(this.bottom * mult) / mult;
        var xmax = Math.round(this.right * mult) / mult;
        var ymax = Math.round(this.top * mult) / mult;
        if (reverseAxisOrder === true) {
            return ymin + "," + xmin + "," + ymax + "," + xmax;
        } else {
            return xmin + "," + ymin + "," + xmax + "," + ymax;
        }
    },
 
    /**
     * APIMethod: toGeometry
     * 基于该 bounds 对象创建一个 polygon 对象.
     *
     * Returns:
     * {<OpenLayers.Geometry.Polygon>} 一个以该 bounds 对象坐标为依据的新的
     *  polygon 对象.
     */
    toGeometry: function() {
        return new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(this.left, this.bottom),
                new OpenLayers.Geometry.Point(this.right, this.bottom),
                new OpenLayers.Geometry.Point(this.right, this.top),
                new OpenLayers.Geometry.Point(this.left, this.top)
            ])
        ]);
    },
    
    /**
     * APIMethod: getWidth
     * 
     * Returns:
     * {Float} bounds 的宽度.
     */
    getWidth:function() {
        return (this.right - this.left);
    },

    /**
     * APIMethod: getHeight
     * 
     * Returns:
     * {Float} bounds 的高度.
     */
    getHeight:function() {
        return (this.top - this.bottom);
    },

    /**
     * APIMethod: getSize
     * 
     * Returns:
     * {<OpenLayers.Size>} box 的 size，包括长和宽.
     */
    getSize:function() {
        return new OpenLayers.Size(this.getWidth(), this.getHeight());
    },

    /**
     * APIMethod: getCenterPixel
     * 
     * Returns:
     * {<OpenLayers.Pixel>} 像素空间中 bounds 中心位置.
     */
    getCenterPixel:function() {
        return new OpenLayers.Pixel( (this.left + this.right) / 2,
                                     (this.bottom + this.top) / 2);
    },

    /**
     * APIMethod: getCenterLonLat
     * 
     * Returns:
     * {<OpenLayers.LonLat>} 像素空间中 bounds 中心位置.
     */
    getCenterLonLat:function() {
        if(!this.centerLonLat) {
            this.centerLonLat = new OpenLayers.LonLat(
                (this.left + this.right) / 2, (this.bottom + this.top) / 2
            );
        }
        return this.centerLonLat;
    },

    /**
     * APIMethod: scale
     * 围绕某个像素点或者经纬度进行缩放。 
     * 注意，即使传递的中心点是像素值，返回的新的边界属性值也有可能不是整数。  
     * Parameters:
     * ratio - {Float} 比例
     * origin - {<OpenLayers.Pixel> or <OpenLayers.LonLat>}
     *          一个像素点或者经纬度点，默认为地图的中心点。
     *
     * Returns:
     * {<OpenLayers.Bounds>} 根据原点和比例缩放得到的新的界限范围。
     */
    scale: function(ratio, origin){
        if(origin == null){
            origin = this.getCenterLonLat();
        }
        
        var origx,origy;

        // get origin coordinates
        if(origin.CLASS_NAME == "OpenLayers.LonLat"){
            origx = origin.lon;
            origy = origin.lat;
        } else {
            origx = origin.x;
            origy = origin.y;
        }

        var left = (this.left - origx) * ratio + origx;
        var bottom = (this.bottom - origy) * ratio + origy;
        var right = (this.right - origx) * ratio + origx;
        var top = (this.top - origy) * ratio + origy;
        
        return new OpenLayers.Bounds(left, bottom, right, top);
    },

    /**
     * APIMethod: add
     * 移动边界
     * Parameters:
     * x - {Float} x方向移动值
     * y - {Float} y方向移动值
     * 
     * Returns:
     * {<OpenLayers.Bounds>} 坐标系不变，根据传入的x,y值而变化的新的边界。
     */
    add:function(x, y) {
        if ( (x == null) || (y == null) ) {
            throw new TypeError('Bounds.add cannot receive null values');
        }
        return new OpenLayers.Bounds(this.left + x, this.bottom + y,
                                     this.right + x, this.top + y);
    },
    
    /**
     * APIMethod: extend
     * 扩展边界范围，使其包括传入的经纬度，点或边界范围。
     *     注意，这个函数默认 left < right 以及 bottom < top。
     * 
     * Parameters: 
     * object - {Object} 可能为 LonLat, Point, or或者Bounds
     */
    extend:function(object) {
        var bounds = null;
        if (object) {
            // 清除缓存的中心点位置
            switch(object.CLASS_NAME) {
                case "OpenLayers.LonLat":    
                    bounds = new OpenLayers.Bounds(object.lon, object.lat,
                                                    object.lon, object.lat);
                    break;
                case "OpenLayers.Geometry.Point":
                    bounds = new OpenLayers.Bounds(object.x, object.y,
                                                    object.x, object.y);
                    break;
                    
                case "OpenLayers.Bounds":    
                    bounds = object;
                    break;
            }
    
            if (bounds) {
                this.centerLonLat = null;
                if ( (this.left == null) || (bounds.left < this.left)) {
                    this.left = bounds.left;
                }
                if ( (this.bottom == null) || (bounds.bottom < this.bottom) ) {
                    this.bottom = bounds.bottom;
                } 
                if ( (this.right == null) || (bounds.right > this.right) ) {
                    this.right = bounds.right;
                }
                if ( (this.top == null) || (bounds.top > this.top) ) { 
                    this.top = bounds.top;
                }
            }
        }
    },

    /**
     * APIMethod: containsLonLat
     * 
     * Parameters:
     * ll - {<OpenLayers.LonLat>|Object} OpenLayers.LonLat 或者一个包含'lon' /'lat' 属性的对象
     * options - {Object} 可选参数
     *
     * Acceptable options: 
     * inclusive - {Boolean} 是否包括边缘
     *     默认 true.
     * worldBounds - {<OpenLayers.Bounds>} 如果提供 worldBounds （全球边界范围）, 当ll超出 worldBounds的话the
     *    就认为该位置在全球范围内。
     *     but can be wrapped around the dateline so it is contained by this
     *     bounds.
     *
     * Returns:
     * {Boolean} The passed-in lonlat is within this bounds.
     */
    containsLonLat: function(ll, options) {
        if (typeof options === "boolean") {
            options =  {inclusive: options};
        }
        options = options || {};
        var contains = this.contains(ll.lon, ll.lat, options.inclusive),
            worldBounds = options.worldBounds;
        if (worldBounds && !contains) {
            var worldWidth = worldBounds.getWidth();
            var worldCenterX = (worldBounds.left + worldBounds.right) / 2;
            var worldsAway = Math.round((ll.lon - worldCenterX) / worldWidth);
            contains = this.containsLonLat({
                lon: ll.lon - worldsAway * worldWidth,
                lat: ll.lat
            }, {inclusive: options.inclusive});
        }
        return contains;
    },

    /**
     * APIMethod: containsPixel
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>} 
     * inclusive - {Boolean} 是否包括边缘，默认为True
     *
     * Returns:
     * {Boolean} 传入的像素坐标是否在bounds范围内
     */
    containsPixel:function(px, inclusive) {
        return this.contains(px.x, px.y, inclusive);
    },
    
    /**
     * APIMethod: contains
     * 
     * Parameters:
     * x - {Float} 
     * y - {Float}
     * inclusive - {Boolean} 是否包括边缘，默认为True
     *
     * Returns:
     * {Boolean} 传入的坐标是否在bounds范围内
     */
    contains:function(x, y, inclusive) {
        //设定默认值
        if (inclusive == null) {
            inclusive = true;
        }

        if (x == null || y == null) {
            return false;
        }

        x = OpenLayers.Util.toFloat(x);
        y = OpenLayers.Util.toFloat(y);

        var contains = false;
        if (inclusive) {
            contains = ((x >= this.left) && (x <= this.right) && 
                        (y >= this.bottom) && (y <= this.top));
        } else {
            contains = ((x > this.left) && (x < this.right) && 
                        (y > this.bottom) && (y < this.top));
        }              
        return contains;
    },

    /**
     * APIMethod: intersectsBounds
     * 判定目标边界范围是否与该实例对象的范围相交。目标范围的任意一条边与该对象相交或者
     * 目标范围在该对象范围内都算相交。
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 目标边界范围
     * options - {Object} 可选参数
     * 
     * Acceptable options:
     * inclusive - {Boolean} 处理边缘是否相交。  默认为True
     *     is true.  如果是false 目标边缘只接触而不是重叠的话，不算相交
     * worldBounds - {<OpenLayers.Bounds>} 如果提供worldBounds, two
     *     bounds will be considered as intersecting if they intersect when 
     *     shifted to within the world bounds.  This applies only to bounds that
     *     cross or are completely outside the world bounds.
     *
     * Returns:
     * {Boolean} 传入的范围是否与该实例对象范围相交
     */
    intersectsBounds:function(bounds, options) {
        if (typeof options === "boolean") {
            options =  {inclusive: options};
        }
        options = options || {};
        if (options.worldBounds) {
            var self = this.wrapDateLine(options.worldBounds);
            bounds = bounds.wrapDateLine(options.worldBounds);
        } else {
            self = this;
        }
        if (options.inclusive == null) {
            options.inclusive = true;
        }
        var intersects = false;
        var mightTouch = (
            self.left == bounds.right ||
            self.right == bounds.left ||
            self.top == bounds.bottom ||
            self.bottom == bounds.top
        );
        
        // 只有一条边接触，并且不包括边缘接触的情况，
        // 这种情况下，不相交
        if (options.inclusive || !mightTouch) {
            // 某条边部分包含目标范围的边界 
            // 边缘包含算交叉的条件下，这两个范围有交叉。
            var inBottom = (
                ((bounds.bottom >= self.bottom) && (bounds.bottom <= self.top)) ||
                ((self.bottom >= bounds.bottom) && (self.bottom <= bounds.top))
            );
            var inTop = (
                ((bounds.top >= self.bottom) && (bounds.top <= self.top)) ||
                ((self.top > bounds.bottom) && (self.top < bounds.top))
            );
            var inLeft = (
                ((bounds.left >= self.left) && (bounds.left <= self.right)) ||
                ((self.left >= bounds.left) && (self.left <= bounds.right))
            );
            var inRight = (
                ((bounds.right >= self.left) && (bounds.right <= self.right)) ||
                ((self.right >= bounds.left) && (self.right <= bounds.right))
            );
            intersects = ((inBottom || inTop) && (inLeft || inRight));
        }
        // document me
        if (options.worldBounds && !intersects) {
            var world = options.worldBounds;
            var width = world.getWidth();
            var selfCrosses = !world.containsBounds(self);
            var boundsCrosses = !world.containsBounds(bounds);
            if (selfCrosses && !boundsCrosses) {
                bounds = bounds.add(-width, 0);
                intersects = self.intersectsBounds(bounds, {inclusive: options.inclusive});
            } else if (boundsCrosses && !selfCrosses) {
                self = self.add(-width, 0);
                intersects = bounds.intersectsBounds(self, {inclusive: options.inclusive});                
            }
        }
        return intersects;
    },
    
    /**
     * APIMethod: containsBounds
     * 确定目标范围是否在该对象实例范围内。
     * 
     * bounds - {<OpenLayers.Bounds>} 目标范围。
     * partial - {Boolean} 如果目标范围任意局部在该对象范围内，则认为目标范围在对象范围内。
     * 默认为false，即必须全部包含才算包含。 
     * inclusive - {Boolean} 共享边是否算包含。默认为True。  
     *
     * Returns:
     * {Boolean} 目标范围是否在该对象实例范围内。
     */
    containsBounds:function(bounds, partial, inclusive) {
        if (partial == null) {
            partial = false;
        }
        if (inclusive == null) {
            inclusive = true;
        }
        var bottomLeft  = this.contains(bounds.left, bounds.bottom, inclusive);
        var bottomRight = this.contains(bounds.right, bounds.bottom, inclusive);
        var topLeft  = this.contains(bounds.left, bounds.top, inclusive);
        var topRight = this.contains(bounds.right, bounds.top, inclusive);
        
        return (partial) ? (bottomLeft || bottomRight || topLeft || topRight)
                         : (bottomLeft && bottomRight && topLeft && topRight);
    },

    /** 
     * APIMethod: determineQuadrant
     * 判断象限
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>}
     * 
     * Returns:
     * {String} 坐标的在bounds范围内的象限 ("br" "tr" "tl" "bl") 
     *     coordinate lies.
     */
    determineQuadrant: function(lonlat) {
    
        var quadrant = "";
        var center = this.getCenterLonLat();
        
        quadrant += (lonlat.lat < center.lat) ? "b" : "t";
        quadrant += (lonlat.lon < center.lon) ? "l" : "r";
    
        return quadrant; 
    },
    
    /**
     * APIMethod: transform
     * 将界限范围从源投影转换为目标投影 
     *
     * Parameters: 
     * source - {<OpenLayers.Projection>} 源投影 
     * dest   - {<OpenLayers.Projection>} 目标投影 
     *
     * Returns:
     * {<OpenLayers.Bounds>} 对象本身, 用于链操作。
     */
    transform: function(source, dest) {
        // 清除缓存的中心位置
        this.centerLonLat = null;
        var ll = OpenLayers.Projection.transform(
            {'x': this.left, 'y': this.bottom}, source, dest);
        var lr = OpenLayers.Projection.transform(
            {'x': this.right, 'y': this.bottom}, source, dest);
        var ul = OpenLayers.Projection.transform(
            {'x': this.left, 'y': this.top}, source, dest);
        var ur = OpenLayers.Projection.transform(
            {'x': this.right, 'y': this.top}, source, dest);
        this.left   = Math.min(ll.x, ul.x);
        this.bottom = Math.min(ll.y, lr.y);
        this.right  = Math.max(lr.x, ur.x);
        this.top    = Math.max(ul.y, ur.y);
        return this;
    },

    /**
     * APIMethod: wrapDateLine
     *  
     * Parameters:
     * maxExtent - {<OpenLayers.Bounds>}
     * options - {Object} Some possible options are:
     *
     * Allowed Options:
     *                    leftTolerance - {float} Allow for a margin of error 
     *                                            with the 'left' value of this 
     *                                            bound.
     *                                            Default is 0.
     *                    rightTolerance - {float} Allow for a margin of error 
     *                                             with the 'right' value of 
     *                                             this bound.
     *                                             Default is 0.
     * 
     * Returns:
     * {<OpenLayers.Bounds>} A copy of this bounds, but wrapped around the 
     *                       "dateline" (as specified by the borders of 
     *                       maxExtent). Note that this function only returns 
     *                       a different bounds value if this bounds is 
     *                       *entirely* outside of the maxExtent. If this 
     *                       bounds straddles the dateline (is part in/part 
     *                       out of maxExtent), the returned bounds will always 
     *                       cross the left edge of the given maxExtent.
     *.
     */
    wrapDateLine: function(maxExtent, options) {    
        options = options || {};
        
        var leftTolerance = options.leftTolerance || 0;
        var rightTolerance = options.rightTolerance || 0;

        var newBounds = this.clone();
    
        if (maxExtent) {
            var width = maxExtent.getWidth();

            //shift right?
            while (newBounds.left < maxExtent.left && 
                   newBounds.right - rightTolerance <= maxExtent.left ) { 
                newBounds = newBounds.add(width, 0);
            }

            //shift left?
            while (newBounds.left + leftTolerance >= maxExtent.right && 
                   newBounds.right > maxExtent.right ) { 
                newBounds = newBounds.add(-width, 0);
            }
           
            // crosses right only? force left
            var newLeft = newBounds.left + leftTolerance;
            if (newLeft < maxExtent.right && newLeft > maxExtent.left && 
                   newBounds.right - rightTolerance > maxExtent.right) {
                newBounds = newBounds.add(-width, 0);
            }
        }
                
        return newBounds;
    },

    CLASS_NAME: "OpenLayers.Bounds"
});

/** 
 * APIFunction: fromString
 * 替代构造函数的方法，根据函字符串参数创建OpenLayers.Bounds对象。
 * 
 * Parameters: 
 * str - {String}逗号分隔的bounds值字符串 (e.g. <i>"5,42,10,45"</i>)
 * reverseAxisOrder - {Boolean} 是否需要旋转[bottom, left, top, right]中四个元素的顺序?
 * 
 * Returns:
 * {<OpenLayers.Bounds>} 根据函字符串参数创建的OpenLayers.Bounds对象
 */
OpenLayers.Bounds.fromString = function(str, reverseAxisOrder) {
    var bounds = str.split(",");
    return OpenLayers.Bounds.fromArray(bounds, reverseAxisOrder);
};

/** 
 * APIFunction: fromArray
 * 替代构造函数的方法，根据array创建OpenLayers.Bounds对象。
 * 
 * Parameters:
 * bbox - {Array(Float)}表示 bounds值的数组  (e.g. <i>[5,42,10,45]</i>)
 * reverseAxisOrder - {Boolean} 是否需要旋转[bottom, left, top, right]中四个元素的顺序?
 *
 * Returns:
 * {<OpenLayers.Bounds>} 根据array创建的OpenLayers.Bounds对象。
 */
OpenLayers.Bounds.fromArray = function(bbox, reverseAxisOrder) {
    return reverseAxisOrder === true ?
           new OpenLayers.Bounds(bbox[1], bbox[0], bbox[3], bbox[2]) :
           new OpenLayers.Bounds(bbox[0], bbox[1], bbox[2], bbox[3]);
};

/** 
 * APIFunction: fromSize
 * 替代构造函数的方法，根据size值创建OpenLayers.Bounds对象
 * 
 * Parameters:
 * size - {<OpenLayers.Size>|Object} OpenLayers.Size 或者带有'w' 和 'h' 属性的对象。
 *
 * Returns:
 * {<OpenLayers.Bounds>} 根据传入的size创建的 bounds 对象。
 */
OpenLayers.Bounds.fromSize = function(size) {
    return new OpenLayers.Bounds(0,
                                 size.h,
                                 size.w,
                                 0);
};

/**
 * Function: oppositeQuadrant
 * 获得给定象限的相对象限
 *
 * Parameters:
 * quadrant - {String} 表示象限的两个字符的缩写
 *
 * Returns:
 * {String} 相对象限 ("br" "tr" "tl" "bl").例，传入'bl'返回'tr',传入'br'返回'tl' 
 */
OpenLayers.Bounds.oppositeQuadrant = function(quadrant) {
    var opp = "";
    
    opp += (quadrant.charAt(0) == 't') ? 'b' : 't';
    opp += (quadrant.charAt(1) == 'l') ? 'r' : 'l';
    
    return opp;
};
