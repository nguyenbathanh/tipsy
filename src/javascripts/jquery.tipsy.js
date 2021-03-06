
(function(jQuery) {
  function maybeCall(thing, ctx) {
    return (typeof thing == "function") ? (thing.call(ctx)) : thing;
  };

  function isElementInDOM(ele) {
    while (ele = ele.parentNode) {
      if (ele == document) return true;
    }
    return false;
  };

  function Tipsy(element, options) {
    this.element = jQuery(element);
    this.options = options;
    this.enabled = true;
    this.fixTitle();
  };

  Tipsy.prototype = {
    show: function() {
      var title = this.getTitle();
      if (title && this.enabled) {
        var tip = this.tip();

        tip.find(".tipsy-inner")[this.options.html ? "html" : "text"](title);
        tip[0].className = "tipsy"; // reset classname in case of dynamic gravity
        tip.remove().css({
          top: 0,
          left: 0,
          visibility: "hidden",
          display: "block"
        }).prependTo(document.body);

        var pos = jQuery.extend({}, this.element.offset(), {
          width: this.element[0].offsetWidth,
          height: this.element[0].offsetHeight
        });

        var actualWidth = tip[0].offsetWidth,
          actualHeight = tip[0].offsetHeight,
          gravity = maybeCall(this.options.gravity, this.element[0]);

        var tp;
        switch (gravity.charAt(0)) {
          case "n":
            tp = {
              top: pos.top + pos.height + this.options.offset,
              left: pos.left + pos.width / 2 - actualWidth / 2
            };
            break;
          case "s":
            tp = {
              top: pos.top - actualHeight - this.options.offset,
              left: pos.left + pos.width / 2 - actualWidth / 2
            };
            break;
          case "e":
            tp = {
              top: pos.top + pos.height / 2 - actualHeight / 2,
              left: pos.left - actualWidth - this.options.offset
            };
            break;
          case "w":
            tp = {
              top: pos.top + pos.height / 2 - actualHeight / 2,
              left: pos.left + pos.width + this.options.offset
            };
            break;
        }

        if (gravity.length == 2) {
          if (gravity.charAt(1) == "w") {
            tp.left = pos.left + pos.width / 2 - 15;
          } else {
            tp.left = pos.left + pos.width / 2 - actualWidth + 15;
          }
        }

        tip.css(tp).addClass("tipsy-" + gravity);
        tip.find(".tipsy-arrow")[0].className = "tipsy-arrow tipsy-arrow-" + gravity.charAt(0);
        if (this.options.className) {
          tip.addClass(maybeCall(this.options.className, this.element[0]));
        }

        if (this.options.fade) {
          tip.stop().css({
            opacity: 0,
            display: "block",
            visibility: "visible"
          }).animate({
            opacity: this.options.opacity
          });
        } else {
          tip.css({
            visibility: "visible",
            opacity: this.options.opacity
          });
        }
      }
    },

    hide: function() {
      if (this.options.fade) {
        this.tip().stop().fadeOut(function() {
          jQuery(this).remove();
        });
      } else {
        this.tip().remove();
      }
    },

    fixTitle: function() {
      if (this.element.attr("title") || typeof(this.element.attr("original-title")) != "string") {
        this.element.attr("original-title", this.element.attr("title") || "").removeAttr("title");
      }
    },

    getTitle: function() {
      var title, o = this.options;
      this.fixTitle();
      title, o = this.options;
      if (typeof o.title == "string") {
        title = this.element.attr(o.title == "title" ? "original-title" : o.title);
      } else if (typeof o.title == "function") {
        title = o.title.call(this.element[0]);
      }
      title = ("" + title).replace(/(^\s*|\s*jQuery)/, "");
      return title || o.fallback;
    },

    tip: function() {
      if (!this.tipDom) {
        this.tipDom = jQuery(document.createElement("div")).addClass("tipsy").html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
        this.tipDom.data("tipsy-pointee", this.element[0]);
      }
      return this.tipDom;
    },

    validate: function() {
      if (!this.element[0].parentNode) {
        this.hide();
        this.element = null;
        this.options = null;
      }
    },

    enable: function() {
      this.enabled = true;
    },
    disable: function() {
      this.enabled = false;
    },
    toggleEnabled: function() {
      this.enabled = !this.enabled;
    }
  };

  jQuery.fn.tipsy = function(options) {

    if (options === true) {
      return this.data("tipsy");
    } else if (typeof options == "string") {
      var tipsy = this.data("tipsy");
      if (tipsy) tipsy[options]();
      return this;
    }

    options = jQuery.extend({}, jQuery.fn.tipsy.defaults, options);

    function get(ele) {
      var tipsy = jQuery.data(ele, "tipsy");
      if (!tipsy) {
        tipsy = new Tipsy(ele, jQuery.fn.tipsy.elementOptions(ele, options));
        jQuery.data(ele, "tipsy", tipsy);
      }
      return tipsy;
    }

    function enter() {
      console.log(this);
      var tipsy = get(this);
      tipsy.hoverState = "in";
      if (options.delayIn == 0) {
        tipsy.show();
      } else {
        tipsy.fixTitle();
        setTimeout(function() {
          if (tipsy.hoverState == "in") tipsy.show();
        }, options.delayIn);
      }
    };

    function leave() {
      var tipsy = get(this);
      tipsy.hoverState = "out";
      if (options.delayOut == 0) {
        tipsy.hide();
      } else {
        setTimeout(function() {
          if (tipsy.hoverState == "out") tipsy.hide();
        }, options.delayOut);
      }
    };

    if (!options.live) this.each(function() {
      get(this);
    });

    if (options.trigger != "manual") {
      var binder = options.live ? "bind" : "bind",
        eventIn = options.trigger == "hover" ? "mouseenter" : "focus",
        eventOut = options.trigger == "hover" ? "mouseleave" : "blur";
      jQuery(document.body).on({
        mouseenter: enter,
        mouseleave: leave
      }, this.selector);
      // console.log(this.selector);
      // this[binder](eventIn, enter)[binder](eventOut, leave);
    }

    return this;

  };

  jQuery.fn.tipsy.defaults = {
    className: null,
    delayIn: 0,
    delayOut: 0,
    fade: false,
    fallback: "",
    gravity: "n",
    html: false,
    live: false,
    offset: 0,
    opacity: 0.8,
    title: "title",
    trigger: "hover"
  };

  jQuery.fn.tipsy.revalidate = function() {
    jQuery(".tipsy").each(function() {
      var pointee = jQuery.data(this, "tipsy-pointee");
      if (!pointee || !isElementInDOM(pointee)) {
        jQuery(this).remove();
      }
    });
  };

  jQuery.fn.tipsy.elementOptions = function(ele, options) {
    return jQuery.metadata ? jQuery.extend({}, options, jQuery(ele).metadata()) : options;
  };

  jQuery.fn.tipsy.autoNS = function() {
    return jQuery(this).offset().top > (jQuery(document).scrollTop() + jQuery(window).height() / 2) ? "s" : "n";
  };

  jQuery.fn.tipsy.autoWE = function() {
    return jQuery(this).offset().left > (jQuery(document).scrollLeft() + jQuery(window).width() / 2) ? "e" : "w";
  };

  jQuery.fn.tipsy.autoBounds = function(margin, prefer) {
    return function() {
      var dir = {
          ns: prefer[0],
          ew: (prefer.length > 1 ? prefer[1] : false)
        },
        boundTop = jQuery(document).scrollTop() + margin,
        boundLeft = jQuery(document).scrollLeft() + margin,
        jQuerythis = jQuery(this);

      if (jQuerythis.offset().top < boundTop) dir.ns = "n";
      if (jQuerythis.offset().left < boundLeft) dir.ew = "w";
      if (jQuery(window).width() + jQuery(document).scrollLeft() - jQuerythis.offset().left < margin) dir.ew = "e";
      if (jQuery(window).height() + jQuery(document).scrollTop() - jQuerythis.offset().top < margin) dir.ns = "s";

      return dir.ns + (dir.ew ? dir.ew : "");
    }
  };

})(jQuery);