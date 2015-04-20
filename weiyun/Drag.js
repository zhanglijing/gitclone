//参数为要移动的对象,作用：无边界限制的拖拽
function Drag(obj) {
    this.obj = obj;
    this.x = 0;
    this.y = 0;
    this.init();
}
Drag.prototype = {
    constructor: Drag,
    init: function() {
        var _this = this;
        this.obj.onmousedown = function(ev) {
            var e = ev || event;
            _this.fnDown(e);

            document.onmousemove = function(ev) {
                var e = ev || event;
                _this.fnMove(e);
            }

            document.onmouseup = function() {
                _this.fnUp();
            }

            return false;
        };
    },
    fnDown: function(e) {
        this.x = e.clientX - this.obj.offsetLeft;
        this.y = e.clientY - this.obj.offsetTop;
    },
    fnMove: function (e) {
        this.obj.style.left = e.clientX - this.x + 'px';
        this.obj.style.top = e.clientY - this.y + 'px';
    },
    fnUp: function() {
        document.onmousemove = document.onmouseup = null;
    }
}
//参数为要移动的对象,作用：有边界限制的拖拽  (Drag2能过继承Drag实现拖拽功能)
function Drag2(obj) {
    //属性继承
    Drag.call(this, obj);
}
//通过for in继承prototype属性方法
for (var attr in Drag.prototype) {
    if (Drag.prototype.hasOwnProperty(attr)) {
        Drag2.prototype[attr] = Drag.prototype[attr];
    }
}
Drag2.prototype.constructor = Drag2;
//重写Drag2的fnMove方法
Drag2.prototype.fnMove = function (e) {
    var L = e.clientX - this.x;
    var T = e.clientY - this.y;

    if (L < 0) {
        L = 0;
    } else if (L > document.documentElement.clientWidth - this.obj.offsetWidth) {
        L = document.documentElement.clientWidth - this.obj.offsetWidth;
    }

    if (T < 0) {
        T = 0;
    } else if (T > document.documentElement.clientHeight - this.obj.offsetHeight) {
        T = document.documentElement.clientHeight - this.obj.offsetHeight;
    }

    this.obj.style.left = L + 'px';
    this.obj.style.top = T + 'px';
}


//调用方式
// 例如：
//     var oDiv1 = document.getElementById('div1');
//     var oDiv2 = document.getElementById('div2');

//     var d1 = new Drag(oDiv1);

//     var d2 = new Drag2(oDiv2);