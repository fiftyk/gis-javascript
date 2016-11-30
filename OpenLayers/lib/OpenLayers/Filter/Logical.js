/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Filter.js
 */

/**
 * Class: OpenLayers.Filter.Logical
 * 描述逻辑 And, Or 和 Not .
 * 
 * Inherits from:
 * - <OpenLayers.Filter>
 */
OpenLayers.Filter.Logical = OpenLayers.Class(OpenLayers.Filter, {

    /**
     * APIProperty: filters
     * {Array(<OpenLayers.Filter>)} 子过滤器.
     */
    filters: null, 
     
    /**
     * APIProperty: type
     * {String} 逻辑运算类型. 可用类型:
     * - OpenLayers.Filter.Logical.AND = "&&";
     * - OpenLayers.Filter.Logical.OR  = "||";
     * - OpenLayers.Filter.Logical.NOT = "!";
     */
    type: null,

    /** 
     * Constructor: OpenLayers.Filter.Logical
     * 创建一个逻辑过滤器 (And, Or, Not).
     *
     * Parameters:
     * options - {Object} 可选参数.
     * 
     * Returns:
     * {<OpenLayers.Filter.Logical>}
     */
    initialize: function(options) {
        this.filters = [];
        OpenLayers.Filter.prototype.initialize.apply(this, [options]);
    },
    
    /** 
     * APIMethod: destroy
     * 销毁.
     */
    destroy: function() {
        this.filters = null;
        OpenLayers.Filter.prototype.destroy.apply(this);
    },

    /**
     * APIMethod: evaluate
     * 在指定上下文执行该过滤器.
     * 
     * Parameters:
     * context - {Object} 执行该过滤器的上下文. 矢量元素(feature)为比较关系过滤器
     * 提供 attributes，为空间过滤器提供 geometries.
     * 
     * Returns:
     * {Boolean} The filter applies.
     */
    evaluate: function(context) {
        var i, len;
        switch(this.type) {
            case OpenLayers.Filter.Logical.AND:
                for (i=0, len=this.filters.length; i<len; i++) {
                    if (this.filters[i].evaluate(context) == false) {
                        return false;
                    }
                }
                return true;
                
            case OpenLayers.Filter.Logical.OR:
                for (i=0, len=this.filters.length; i<len; i++) {
                    if (this.filters[i].evaluate(context) == true) {
                        return true;
                    }
                }
                return false;
            
            case OpenLayers.Filter.Logical.NOT:
                return (!this.filters[0].evaluate(context));
        }
        return undefined;
    },
    
    /**
     * APIMethod: clone
     * 克隆该过滤器.
     * 
     * Returns:
     * {<OpenLayers.Filter.Logical>} 该过滤器的克隆.
     */
    clone: function() {
        var filters = [];        
        for(var i=0, len=this.filters.length; i<len; ++i) {
            filters.push(this.filters[i].clone());
        }
        return new OpenLayers.Filter.Logical({
            type: this.type,
            filters: filters
        });
    },
    
    CLASS_NAME: "OpenLayers.Filter.Logical"
});


OpenLayers.Filter.Logical.AND = "&&";
OpenLayers.Filter.Logical.OR  = "||";
OpenLayers.Filter.Logical.NOT = "!";
