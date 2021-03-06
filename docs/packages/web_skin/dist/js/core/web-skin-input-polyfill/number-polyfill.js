
/*
HTML5 Number polyfill for Workiva's Web Skin Platform
Aaron Lademann | https://github.com/Workiva/web-skin-input-polyfill
---
Adapted from Jonathan Stipe's https://github.com/jonstipe/number-polyfill
 */

(function() {
  (function($) {

    /*
    OPTIONS
     */
    var isBrowserTheDevil, isUnitTestRunner, numberPolyfill, options, shouldPolyfill;
    options = {
      isDisabled: false,
      inputClass: "form-control",
      btnClass: "btn btn-xs btn-default",
      btnUpContent: "<i class='caret caret-sm caret-up' />",
      btnDownContent: "<i class='caret caret-sm' />"
    };
    isBrowserTheDevil = function() {
      return /MSIE|Trident/g.test(navigator.userAgent);
    };
    isUnitTestRunner = function() {
      return /PhantomJS/g.test(navigator.userAgent);
    };
    shouldPolyfill = function() {
      var i, noSupport, partialSupport;
      i = document.createElement("input");
      i.setAttribute("type", "number");

      /*
      Most browsers that don't support number inputs will return a type of "text", even when the element is created with a type of number.
      However, since MSIE 10 / 11+ is "special"... they return number as the type... even though they don't fully support it!
       */
      noSupport = i.type === "text";
      partialSupport = isBrowserTheDevil();
      return noSupport || partialSupport || isUnitTestRunner();
    };
    if (shouldPolyfill()) {
      $.fn.inputNumber = function() {
        $(this).filter(function() {
          var $this;
          $this = $(this);
          return $this.is('input[type="number"]') && !($this.parent().is(".input-group") && $this.next().is("div.number-spin-btn-container"));
        }).each(function() {
          var disabledClass;
          options.isDisabled = $(this).is(':disabled');
          disabledClass = ' ';
          if (options.isDisabled) {
            disabledClass = ' disabled ';
          }
          options.btnClass += disabledClass;
          numberPolyfill.polyfills.push(new numberPolyfill(this, options));
        });
        return $(this);
      };
      numberPolyfill = function(elem, options) {
        var $fieldContainer, MutationObserver, attrObserver;
        this.elem = $(elem);
        this.options = options;
        if (!(this.elem.is(":root *") && this.elem.height() > 0)) {
          throw new Error("Element must be in DOM and displayed so that its height can be measured.");
        }
        this.elem.addClass('number-polyfill');
        this.upBtn = $('<div/>', {
          "class": this.options.btnClass + ' grid-block grid-content grid-collapse number-spin-btn number-spin-btn-up'
        });
        this.downBtn = $('<div/>', {
          "class": this.options.btnClass + ' grid-block grid-content grid-collapse number-spin-btn number-spin-btn-down'
        });
        this.btnContainer = $('<div/>', {
          "class": 'input-group-btn number-spin-btn-container grid-vertical'
        });
        this.btnGroup = $('<div/>', {
          "class": 'btn-group btn-group-vertical grid-block grid-vertical'
        });
        $fieldContainer = $('<div/>', {
          "class": 'input-group'
        });
        this.btnGroup.appendTo(this.btnContainer);
        this.upBtn.appendTo(this.btnGroup);
        this.downBtn.appendTo(this.btnGroup);
        $(this.options.btnUpContent).appendTo(this.upBtn);
        $(this.options.btnDownContent).appendTo(this.downBtn);
        this.elem.wrap($fieldContainer);
        this.btnContainer.insertAfter(this.elem);
        this.elem.on({
          focus: (function(_this) {
            return function(e) {
              _this.elem.on({
                DOMMouseScroll: numberPolyfill.domMouseScrollHandler,
                mousewheel: numberPolyfill.mouseWheelHandler
              }, {
                p: _this
              });
            };
          })(this),
          blur: (function(_this) {
            return function(e) {
              _this.elem.off({
                DOMMouseScroll: numberPolyfill.domMouseScrollHandler,
                mousewheel: numberPolyfill.mouseWheelHandler
              });
            };
          })(this)
        });
        this.elem.on({
          keypress: numberPolyfill.elemKeypressHandler,
          change: numberPolyfill.elemChangeHandler
        }, {
          p: this
        });
        this.upBtn.on("mousedown", {
          p: this,
          func: "increment"
        }, numberPolyfill.elemBtnMousedownHandler);
        this.downBtn.on("mousedown", {
          p: this,
          func: "decrement"
        }, numberPolyfill.elemBtnMousedownHandler);
        this.attrMutationHandler("class");
        if ((typeof WebKitMutationObserver !== "undefined" && WebKitMutationObserver !== null) || (typeof MutationObserver !== "undefined" && MutationObserver !== null)) {
          if ((typeof WebKitMutationObserver !== "undefined" && WebKitMutationObserver !== null) && (typeof MutationObserver === "undefined" || MutationObserver === null)) {
            MutationObserver = WebKitMutationObserver;
          }
          attrObserver = new MutationObserver((function(_this) {
            return function(mutations, observer) {
              var mutation, _i, _len;
              for (_i = 0, _len = mutations.length; _i < _len; _i++) {
                mutation = mutations[_i];
                if (mutation.type === "attributes") {
                  _this.attrMutationHandler(mutation.attributeName, mutation.oldValue, _this.elem.attr(mutation.attributeName));
                }
              }
            };
          })(this));
          attrObserver.observe(elem, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ["class", "style", "min", "max", "step"]
          });
        } else if (typeof MutationEvent !== "undefined" && MutationEvent !== null) {
          this.elem.on("DOMAttrModified", (function(_this) {
            return function(evt) {
              _this.attrMutationHandler(evt.originalEvent.attrName, evt.originalEvent.prevValue, evt.originalEvent.newValue);
            };
          })(this));
        }
      };
      numberPolyfill.polyfills = [];
      numberPolyfill.isNumber = function(input) {
        if ((input != null) && typeof input.toString === "function") {
          return /^-?\d+(?:\.\d+)?$/.test(input.toString());
        } else {
          return false;
        }
      };
      numberPolyfill.isFloat = function(input) {
        if ((input != null) && typeof input.toString === "function") {
          return /^-?\d+\.\d+$/.test(input.toString());
        } else {
          return false;
        }
      };
      numberPolyfill.isInt = function(input) {
        if ((input != null) && typeof input.toString === "function") {
          return /^-?\d+$/.test(input.toString());
        } else {
          return false;
        }
      };
      numberPolyfill.isNegative = function(input) {
        if ((input != null) && typeof input.toString === "function") {
          return /^-\d+(?:\.\d+)?$/.test(input.toString());
        } else {
          return false;
        }
      };
      numberPolyfill.raiseNum = function(num) {
        var a, numi, nump;
        if (typeof num === "number" || (typeof num === "object" && num instanceof Number)) {
          if (num % 1) {
            return {
              num: num.toString(),
              precision: 0
            };
          } else {
            return numberPolyfill.raiseNum(num.toString());
          }
        } else if (typeof num === "string" || (typeof num === "object" && num instanceof String)) {
          if (numberPolyfill.isFloat(num)) {
            num = num.replace(/(\.\d)0+$/, "$1");
            nump = numberPolyfill.getPrecision(num);
            numi = num.slice(0, -(nump + 1)) + num.slice(-nump);
            numi = numi.replace(/^(-?)0+(\d+)/, "$1$2");
            a = {
              num: numi,
              precision: nump
            };
            return a;
          } else if (numberPolyfill.isInt(num)) {
            return {
              num: num,
              precision: 0
            };
          }
        }
      };
      numberPolyfill.raiseNumPrecision = function(rNum, newPrecision) {
        var i, _i, _ref;
        if (rNum.precision < newPrecision) {
          for (i = _i = _ref = rNum.precision; _ref <= newPrecision ? _i < newPrecision : _i > newPrecision; i = _ref <= newPrecision ? ++_i : --_i) {
            rNum.num += "0";
          }
          rNum.precision = newPrecision;
        }
      };
      numberPolyfill.lowerNum = function(num) {
        if (num.precision > 0) {
          while (num.num.length < (num.precision + 1)) {
            if (numberPolyfill.isNegative(num.num)) {
              num.num = num.num.slice(0, 1) + "0" + num.num.slice(1);
            } else {
              num.num = "0" + num.num;
            }
          }
          return (num.num.slice(0, -num.precision) + "." + num.num.slice(-num.precision)).replace(/\.?0+$/, '').replace(/^(-?)(\.)/, "$10$2");
        } else {
          return num.num;
        }
      };
      numberPolyfill.preciseAdd = function(num1, num2) {
        var num1i, num2i, result;
        if ((typeof num1 === "number" || (typeof num1 === "object" && num1 instanceof Number)) && (typeof num2 === "number" || (typeof num2 === "object" && num2 instanceof Number))) {
          if (num1 % 1 === 0 && num2 % 1 === 0) {
            return (num1 + num2).toString();
          } else {
            return numberPolyfill.preciseAdd(num1.toString(), num2.toString());
          }
        } else if ((typeof num1 === "string" || (typeof num1 === "object" && num1 instanceof String)) && (typeof num2 === "string" || (typeof num2 === "object" && num2 instanceof String))) {
          if (numberPolyfill.isNumber(num1)) {
            if (numberPolyfill.isNumber(num2)) {
              if (numberPolyfill.isInt(num1)) {
                if (numberPolyfill.isInt(num2)) {
                  return numberPolyfill.preciseAdd(parseInt(num1, 10), parseInt(num2, 10));
                } else if (numberPolyfill.isFloat(num2)) {
                  num1 += ".0";
                }
              } else if (numberPolyfill.isFloat(num1)) {
                if (numberPolyfill.isInt(num2)) {
                  num2 += ".0";
                }
              }
              num1i = numberPolyfill.raiseNum(num1);
              num2i = numberPolyfill.raiseNum(num2);
              if (num1i.precision < num2i.precision) {
                numberPolyfill.raiseNumPrecision(num1i, num2i.precision);
              } else if (num1i.precision > num2i.precision) {
                numberPolyfill.raiseNumPrecision(num2i, num1i.precision);
              }
              result = (parseInt(num1i.num, 10) + parseInt(num2i.num, 10)).toString();
              if (num1i.precision > 0) {
                if (numberPolyfill.isNegative(result)) {
                  while (num1i.precision > (result.length - 1)) {
                    result = "-0" + result.slice(1);
                  }
                } else {
                  while (num1i.precision > result.length) {
                    result = "0" + result;
                  }
                }
                result = numberPolyfill.lowerNum({
                  num: result,
                  precision: num1i.precision
                });
              }
              result = result.replace(/^(-?)\./, '$10.');
              if (numberPolyfill.isFloat(result)) {
                result = result.replace(/0+$/, '');
              }
              return result;
            } else {
              throw new SyntaxError("Argument \"" + num2 + "\" is not a number.");
            }
          } else {
            throw new SyntaxError("Argument \"" + num1 + "\" is not a number.");
          }
        } else {
          return numberPolyfill.preciseAdd(num1.toString(), num2.toString());
        }
      };
      numberPolyfill.preciseSubtract = function(num1, num2) {
        if (typeof num2 === "number" || (typeof num2 === "object" && num2 instanceof Number)) {
          return numberPolyfill.preciseAdd(num1, -num2);
        } else if (typeof num2 === "string" || (typeof num2 === "object" && num2 instanceof String)) {
          if (numberPolyfill.isNegative(num2)) {
            return numberPolyfill.preciseAdd(num1, num2.slice(1));
          } else {
            return numberPolyfill.preciseAdd(num1, "-" + num2);
          }
        }
      };
      numberPolyfill.getPrecision = function(num) {
        var k, kNum;
        if (typeof num === "number") {
          k = 0;
          kNum = num;
          while (kNum !== Math.floor(kNum)) {
            kNum = num * Math.pow(10, ++k);
          }
          return k;
        } else if (typeof num === "string") {
          if (numberPolyfill.isNumber(num)) {
            if (numberPolyfill.isFloat(num)) {
              return /^-?\d+(?:\.(\d+))?$/.exec(num)[1].length;
            } else {
              return 0;
            }
          }
        }
      };
      numberPolyfill.prototype.getParams = function() {
        var max, min, step, val;
        step = this.elem.attr('step');
        min = this.elem.attr('min');
        max = this.elem.attr('max');
        val = this.elem.val();
        if (!numberPolyfill.isNumber(step)) {
          step = null;
        }
        if (!numberPolyfill.isNumber(min)) {
          min = null;
        }
        if (!numberPolyfill.isNumber(max)) {
          max = null;
        }
        if (!numberPolyfill.isNumber(val)) {
          val = min || 0;
        }
        return {
          min: (min != null) ? min : null,
          max: (max != null) ? max : null,
          step: (step != null) ? step : "1",
          val: (val != null) ? val : null
        };
      };
      numberPolyfill.prototype.clipValues = function(value, min, max) {
        if ((max != null) && parseFloat(value) > parseFloat(max)) {
          return max;
        } else if ((min != null) && parseFloat(value) < parseFloat(min)) {
          return min;
        } else {
          return value;
        }
      };
      numberPolyfill.prototype.stepNormalize = function(value) {
        var cValue, min, params, sn, step;
        params = this.getParams();
        step = params['step'];
        min = params['min'];
        if (step == null) {
          return value;
        } else {
          step = numberPolyfill.raiseNum(step);
          cValue = numberPolyfill.raiseNum(value);
          if (cValue.precision > step.precision) {
            numberPolyfill.raiseNumPrecision(step, cValue.precision);
          } else if (cValue.precision < step.precision) {
            numberPolyfill.raiseNumPrecision(cValue, step.precision);
          }
          if (min != null) {
            cValue = numberPolyfill.raiseNum(numberPolyfill.preciseSubtract(value, min));
            numberPolyfill.raiseNumPrecision(cValue, step.precision);
          }
          if (parseFloat(cValue.num) % parseFloat(step.num) === 0) {
            return value;
          } else {
            cValue = numberPolyfill.lowerNum({
              num: (Math.round(parseFloat(cValue.num) / (sn = parseFloat(step.num))) * sn).toString(),
              precision: cValue.precision
            });
            if (min != null) {
              cValue = numberPolyfill.preciseAdd(cValue, min);
            }
            return cValue;
          }
        }
      };
      numberPolyfill.domMouseScrollHandler = function(evt) {
        var p;
        p = evt.data.p;
        evt.preventDefault();
        if (evt.originalEvent.detail < 0) {
          p.increment();
        } else {
          p.decrement();
        }
      };
      numberPolyfill.mouseWheelHandler = function(evt) {
        var p;
        p = evt.data.p;
        evt.preventDefault();
        if (evt.originalEvent.wheelDelta > 0) {
          p.increment();
        } else {
          p.decrement();
        }
      };
      numberPolyfill.elemKeypressHandler = function(evt) {
        var p, _ref, _ref1;
        p = evt.data.p;
        if (evt.keyCode === 38) {
          p.increment();
        } else if (evt.keyCode === 40) {
          p.decrement();
        } else if (((_ref = evt.keyCode) !== 8 && _ref !== 9 && _ref !== 35 && _ref !== 36 && _ref !== 37 && _ref !== 39 && _ref !== 46) && ((_ref1 = evt.which) !== 45 && _ref1 !== 48 && _ref1 !== 49 && _ref1 !== 50 && _ref1 !== 51 && _ref1 !== 52 && _ref1 !== 53 && _ref1 !== 54 && _ref1 !== 55 && _ref1 !== 56 && _ref1 !== 57)) {
          evt.preventDefault();
        }
      };
      numberPolyfill.elemChangeHandler = function(evt) {
        var min, newVal, p, params;
        p = evt.data.p;
        if (numberPolyfill.isNumber(p.elem.val())) {
          params = p.getParams();
          newVal = p.clipValues(params['val'], params['min'], params['max']);
          newVal = p.stepNormalize(newVal);
          if (newVal.toString() !== p.elem.val()) {
            p.elem.val(newVal).change();
          }
        } else {
          min = p.elem.attr('min');
          p.elem.val((min != null) && numberPolyfill.isNumber(min) ? min : "0").change();
        }
      };
      numberPolyfill.elemBtnMousedownHandler = function(evt) {
        var func, p, releaseFunc, timeoutFunc;
        p = evt.data.p;
        func = evt.data.func;
        p[func]();
        timeoutFunc = (function(_this) {
          return function(incFunc) {
            p[func]();
            p.timeoutID = window.setTimeout(timeoutFunc, 10);
          };
        })(this);
        releaseFunc = (function(_this) {
          return function(e) {
            window.clearTimeout(p.timeoutID);
            $(document).off('mouseup', releaseFunc);
            $(_this).off('mouseleave', releaseFunc);
          };
        })(this);
        $(document).on('mouseup', releaseFunc);
        $(this).on('mouseleave', releaseFunc);
        p.timeoutID = window.setTimeout(timeoutFunc, 700);
      };
      numberPolyfill.prototype.attrMutationHandler = function(name, oldValue, newValue) {
        var ei, h, i, _i, _len, _ref;
        if (name === "class" || name === "style") {
          h = {};
          ei = null;
          _ref = ["opacity", "visibility", "-moz-transition-property", "-moz-transition-duration", "-moz-transition-timing-function", "-moz-transition-delay", "-webkit-transition-property", "-webkit-transition-duration", "-webkit-transition-timing-function", "-webkit-transition-delay", "-o-transition-property", "-o-transition-duration", "-o-transition-timing-function", "-o-transition-delay", "transition-property", "transition-duration", "transition-timing-function", "transition-delay"];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            if ((ei = this.elem.css(i)) !== this.btnContainer.css(i)) {
              h[i] = ei;
            }
          }
          if (this.elem.css("display") === "none") {
            h["display"] = "none";
          } else {
            h["display"] = "inherit";
          }
          this.btnContainer.css(h);
        } else if (name === "min" || name === "max" || name === "step") {
          this.elem.change();
        }
      };
      numberPolyfill.prototype.increment = function() {
        var newVal, params;
        if (!this.elem.is(":disabled")) {
          params = this.getParams();
          newVal = numberPolyfill.preciseAdd(params['val'], params['step']);
          if ((params['max'] != null) && parseFloat(newVal) > parseFloat(params['max'])) {
            newVal = params['max'];
          }
          newVal = this.stepNormalize(newVal);
          this.elem.val(newVal).change();
        }
      };
      numberPolyfill.prototype.decrement = function() {
        var newVal, params;
        if (!this.elem.is(":disabled")) {
          params = this.getParams();
          newVal = numberPolyfill.preciseSubtract(params['val'], params['step']);
          if ((params['min'] != null) && parseFloat(newVal) < parseFloat(params['min'])) {
            newVal = params['min'];
          }
          newVal = this.stepNormalize(newVal);
          this.elem.val(newVal).change();
        }
      };
    } else {
      $.fn.inputNumber = function() {
        return $(this);
      };
      return;
    }
    $(function() {
      if (!isUnitTestRunner()) {
        $('input[type="number"]').inputNumber();
      }
    });
  })(jQuery);

}).call(this);
