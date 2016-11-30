/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/SingleFile.js
 */

/**
 * Namespace: OpenLayers.Date
 * Contains implementations of Date.parse and date.toISOString that match the
 *     ECMAScript 5 specification for parsing RFC 3339 dates.
 *     http://tools.ietf.org/html/rfc3339
 */
OpenLayers.Date = {

    /**
     * APIMethod: toISOString
     *     将一个时间用字符串表示。 字符串的格式遵循ISO 8601规定的因特网中的
     *     日期和时间标准的基本形式 (详情见http://tools.ietf.org/html/rfc3339)
     *     如果toISOString方法在Date原型中有效,则使用这个方法。Data 实例的
     *     toISOString 方法 在ECMA-262中定义。
     *
     * Parameters:
     * date - {Date} 一个时间（Date）对象。
     *
     * Returns:
     * {String} 字符串形式表示的日期。 (e.g. "2010-08-07T16:58:23.123Z")
     *     如果这是个无效时间(i.g. isNaN(date.getTime())判断)。在Firefox中会
     *     返回一个字符串"Invalid Date"。但是其实在ECMA 标准中指出在这种情况
     *     下toISOString应该抛出范围异常。所以最好在生成字符串之前使用
     *     isNaN(date.getTime())进行判断以确保数据的有效性。
     */
    toISOString: (function() {
        if ("toISOString" in Date.prototype) {
            return function(date) {
                return date.toISOString();
            };
        } else {
            function pad(num, len) {
                var str = num + "";
                while (str.length < len) {
                    str = "0" + str;
                }
                return str;
            }
            return function(date) {
                var str;
                if (isNaN(date.getTime())) {
                    // ECMA-262 建议抛出范围异常
                    // Firefox返回"Invalid Date"
                    str = "Invalid Date";
                } else {
                    str =
                        date.getUTCFullYear() + "-" +
                        pad(date.getUTCMonth() + 1, 2) + "-" +
                        pad(date.getUTCDate(), 2) + "T" +
                        pad(date.getUTCHours(), 2) + ":" +
                        pad(date.getUTCMinutes(), 2) + ":" +
                        pad(date.getUTCSeconds(), 2) + "." +
                        pad(date.getUTCMilliseconds(), 3) + "Z";
                }
                return str;
            };
        }

    })(),

    /**
     * APIMethod: parse
     *     解析一个包含日期的字符串。字符串的格式遵循ISO 8601规定的因特网中的日期和时
     *     间标准的基本形式(详情见http://tools.ietf.org/html/rfc3339).
     *     由于不同浏览器处理机制的区别，我们不调用JS内置的Date.parse方法。  
     *     在Chrome中,使用Date.parse方法解读一个没有时区信息的字符串(e.g. "2011")
     *     默认解译为地方时，而在Firefox,则解译为UTC(标准时间).
     *
     * Parameters:
     * str - {String} 字符串形式的时间数据 (e.g.
     *     "2010", "2010-08", "2010-08-07", "2010-08-07T16:58:23.123Z",
     *     "2010-08-07T11:58:23.123-06").
     *
     * Returns:
     * {Date} data对象。如果解析不成功，返回一个无效数据 。(i.e. isNaN(date.getTime())).
     */
    parse: function(str) {
        var date;
        var match = str.match(/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:(?:T(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z|(?:[+-]\d{1,2}(?::(\d{2}))?)))|Z)?$/);
        if (match && (match[1] || match[7])) { // must have at least year or time
            var year = parseInt(match[1], 10) || 0;
            var month = (parseInt(match[2], 10) - 1) || 0;
            var day = parseInt(match[3], 10) || 1;
            date = new Date(Date.UTC(year, month, day));
            // optional time
            var type = match[7];
            if (type) {
                var hours = parseInt(match[4], 10);
                var minutes = parseInt(match[5], 10);
                var secFrac = parseFloat(match[6]);
                var seconds = secFrac | 0;
                var milliseconds = Math.round(1000 * (secFrac - seconds));
                date.setUTCHours(hours, minutes, seconds, milliseconds);
                // check offset
                if (type !== "Z") {
                    var hoursOffset = parseInt(type, 10);
                    var minutesOffset = parseInt(match[8], 10) || 0;
                    var offset = -1000 * (60 * (hoursOffset * 60) + minutesOffset * 60);
                    date = new Date(date.getTime() + offset);
                }
            }
        } else {
            date = new Date("invalid");
        }
        return date;
    }
};
