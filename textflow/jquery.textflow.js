/*

 Version: 1.00
 Author: Michael Jünger
 Website: https://michael.xn--jnger-kva.name
 Docs: https://github.com/mhaze4/jquery-textflow
 Repo: https://github.com/mhaze4/jquery-textflow
 Issues: https://github.com/mhaze4/jquery-textflow/issues
 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function ($)
{
    /********************************************/
    /********************************************/
    /*****************TOOLS**********************/
    /********************************************/
    /********************************************/

    var random = function (minVal, maxVal)
    {
        if (maxVal)
            return minVal + Math.floor(Math.random() * (maxVal - minVal));

        return Math.floor(Math.random() * minVal);
    };

    /**
     * Randomized setTimeout
     * @param {Function} func The function that is called by random
     * @param {Number} minVal The minimum interval of time passed until the next call
     * @param {Number} maxVal The maximum interval of time passed until the next call
     * @returns {number} The id of setTimeout
     */
    var randomSetTimeout = function (func, minVal, maxVal)
    {
        return setTimeout(func, random(minVal, maxVal));
    };

    /********************************************/
    /********************************************/
    /***************DIRECTION********************/
    /********************************************/
    /********************************************/

    var Direction = function (directionsArray)
    {
        var self = this;
        var directions = directionsArray ? directionsArray : self.getDefaultDirections();

        this.x = directions[random(directions.length)].x;
        this.y = directions[random(directions.length)].y;
    };

    /*
     Directions: Not set on index zero, following north,
     north east, ..., up to north west clockwise
     */
    Direction.prototype.directions = {
        none: {x: 0, y: 0},
        north: {x: 0, y: -1},
        northEast: {x: 1, y: -1},
        east: {x: 1, y: 0},
        southEast: {x: 1, y: 1},
        south: {x: 0, y: 1},
        southWest: {x: -1, y: 1},
        west: {x: -1, y: 0},
        northWest: {x: -1, y: -1}
    };

    Direction.prototype.getDefaultDirections = function ()
    {
        var tmp = [];

        for (var d in self.directions)
        {
            if (self.directions.hasOwnProperty(d))
            {
                tmp.push(self.directions[d]);
            }
        }

        return tmp;
    };

    /********************************************/
    /********************************************/
    /******************TEXT**********************/
    /********************************************/
    /********************************************/

    var Text = function (settings, x, y, w, h, maxAx, textDirection, world, text, fontSize)
    {
        var self = this;

        var accelerateId = null;
        var breakDownId = null;

        var update = function ()
        {
            self.rect = {
                top: self.y - self.h,
                right: self.x + self.w,
                bottom: self.y,
                left: self.x
            };
        };

        var borderCollision = function (dir)
        {
            if (dir < 0)
            {
                if (self.rect.right < 0)
                    world.removeElement(self);
            }
            else
            {
                if (self.rect.left > world.width)
                    world.removeElement(self);
            }
        };

        var accelerate = function ()
        {
            self.ax += self.acceleration * textDirection.x;

            if (Math.abs(self.ax) < Math.abs(self.maxAx))
                accelerateId = setTimeout(accelerate, 40);
            else
                self.ax = self.maxAx;
        };

        var breakDown = function ()
        {
            self.ax += .1 * textDirection.x;

            if (Math.abs(self.ax) > Math.abs(self.maxAx))
                breakDownId = setTimeout(breakDown, 40);
            else
            {
                self.ax = self.maxAx;
                accelerateId = null;
            }
        };

        this.x = x;
        this.y = y;

        this.maxAx = maxAx;
        this.ax = 0;
        this.ay = 0;

        this.text = text;
        this.fontSize = fontSize;
        this.font = fontSize + 'pt ' + settings.font;

        this.color = settings.color;

        this.acceleration = 1 / self.fontSize;

        this.w = w;
        this.h = h;

        this.vx = 0;
        this.vy = 0;

        this.rect = function ()
        {
            return {
                top: self.y - self.fontSize,
                right: self.x + self.w,
                bottom: (self.y - self.fontSize) + self.h,
                left: self.x
            };
        };

        this.boostUp = function (obj)
        {
            self.ax += (obj.ax - self.ax) * (obj.fontSize / self.fontSize);

            clearTimeout(breakDownId);
            clearTimeout(accelerateId);

            breakDown();
        };

        this.breakDown = function (obj)
        {
            self.ax -= self.ax * (obj.fontSize / self.fontSize);

            clearTimeout(accelerateId);
            clearTimeout(breakDownId);

            accelerate();
        };

        this.start = function ()
        {
            accelerate();
        };

        this.move = function ()
        {
            self.vx = self.ax;
            self.vy = self.ay;

            self.x += self.vx;
            self.y += self.vy;

            update();
            borderCollision(textDirection.x);
        };

        update();
    };

    /********************************************/
    /********************************************/
    /**************TEXT WRITER*******************/
    /********************************************/
    /********************************************/

    var TextWriter = function (settings, textDirection, world, view, width, height, marginTop, marginBottom, maxTexts, texts)
    {
        var self = this;
        var textId = null;
        var oldFontSize = 0;

        var minFs = window.innerWidth <= 800 ? 12 : 16;
        var maxFs = window.innerWidth <= 800 ? 16 : 20;

        var addText = function ()
        {
            if (world.getElements().length < maxTexts)
            {
                var fontSize = random(minFs, maxFs);

                var string = texts[random(texts.length)];
                var textWidth;

                var x;
                var speed = (random(1, 10) * textDirection.x);

                view.txtCtx.font = fontSize + "pt " + settings.font;
                textWidth = view.txtCtx.measureText(string).width;

                x = textDirection.x < 0 ? self.width : -textWidth;

                oldFontSize = fontSize;

                var text = new Text(
                    settings,
                    x,
                    random(self.marginTop, self.height - self.marginBottom - self.marginTop - fontSize),
                    textWidth,
                    fontSize,
                    speed,
                    textDirection,
                    world,
                    string,
                    fontSize
                );

                world.addElement(text);
                text.start();
            }

            textId = randomSetTimeout(addText, 1000, 2500);
        };

        this.width = width;
        this.height = height;

        this.marginTop = marginTop;
        this.marginBottom = marginBottom;

        this.resize = function (width, height)
        {
            self.width = width;
            self.height = height;
        };

        this.start = function ()
        {
            addText();
        };

        this.stop = function ()
        {
            clearTimeout(textId);
        };
    };

    /********************************************/
    /********************************************/
    /***********TEXT FLOW VIEW*******************/
    /********************************************/
    /********************************************/

    var TextFlowView = function (settings, target, world, width, height, top, left)
    {
        var self = this;

        var textCanvas = $('<canvas></canvas>');
        var txtCtx = textCanvas[0].getContext('2d');

        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame;

        var cancelAnimationFrame = window.cancelAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame;

        var renderId = null;

        var renderView = function ()
        {
            var elements = world.getElements();
            var i, e;

            self.clear();

            for (i = 0; i < elements.length; i++)
            {
                e = elements[i];

                txtCtx.font = e.font;

                txtCtx.fillStyle = e.color;
                txtCtx.fillText(e.text, e.x, e.y);
            }

            renderId = requestAnimationFrame(renderView);
        };

        this.resize = function (top, left)
        {
            textCanvas.attr('width', target.width());
            textCanvas.attr('height', target.height());

            textCanvas.css({
                'width': target.width() + 'px',
                'height': target.height() + 'px',
                'top': top ? top + 'px' : 0,
                'left': left ? left + 'px' : 0
            });
        };

        this.txtCtx = txtCtx;

        this.clear = function ()
        {
            var old = txtCtx.fillStyle;

            txtCtx.fillStyle = 'rgba(255, 0, 0, 1)';
            txtCtx.clearRect(0, 0, target.outerWidth(), target.outerHeight());
            txtCtx.fillStyle = old;
        };

        this.size = function ()
        {
            return {
                'width': target.outerWidth(),
                'height': target.outerHeight()
            };
        };

        this.start = function ()
        {
            txtCtx.textAlign = "start";
            renderView();
        };

        this.stop = function ()
        {
            cancelAnimationFrame(renderId);
            self.clear();
        };

        textCanvas.css({'position': 'absolute', 'z-index': 2, 'background': 'transparent'});
        target.css('background', settings.background);
        textCanvas.appendTo(target);

        self.resize(width, height, top, left);
    };

    /********************************************/
    /********************************************/
    /********************WORLD*******************/
    /********************************************/
    /********************************************/

    var World = function (textDirection, width, height)
    {
        var self = this;
        var updateId = null;

        var elements = [];
        var texts = [];

        var getCollisionAxis = function (a, b)
        {
            var xValues = [a.x, a.x + a.width, b.x, b.x + b.width];
            var yValues = [a.y, a.y + a.height, b.y, b.y + b.height];

            var sort = function (a, b)
            {
                return a - b;
            };

            xValues.sort(sort);
            yValues.sort(sort);

            var overlappingX = xValues[2] - xValues[1];
            var overlappingY = yValues[2] - yValues[1];

            return overlappingX > overlappingY ? 'x' : 'y';
        };

        var areObjectsColliding = function (a, b)
        {
            if (a.rect.left > b.rect.right || b.rect.left > a.rect.right)
            {
                return false;
            }
            else if (a.rect.top > b.rect.bottom || b.rect.top > a.rect.bottom)
            {
                return false;
            }

            return true;
        };

        var detectCollisions = function ()
        {
            for (var i = 0; i < texts.length - 1; i++)
            {
                var a = texts[i];

                for (var j = i + 1; j < texts.length; j++)
                {
                    var b = texts[j];

                    if (areObjectsColliding(a, b))
                    {
                        var axis = getCollisionAxis(a, b);

                        if (axis === 'y')
                        {
                            var left;
                            var right;

                            if (textDirection.x < 0)
                            {
                                if (a.rect.left < b.rect.left)
                                {
                                    left = a;
                                    right = b;
                                }
                                else
                                {
                                    left = b;
                                    right = a;
                                }

                                left.boostUp(right);
                                right.breakDown(left);
                            }
                            else
                            {
                                if (a.rect.right > b.rect.right)
                                {
                                    left = b;
                                    right = a;
                                }
                                else
                                {
                                    left = a;
                                    right = b;
                                }

                                right.boostUp(left);
                                left.breakDown(right);
                            }
                        }
                    }
                }
            }
        };

        var updateElements = function ()
        {
            for (var i = 0; i < elements.length; i++)
            {
                var e = elements[i];
                e.move();
            }
        };

        var updateWorld = function ()
        {
            updateElements();
            detectCollisions();

            updateId = setTimeout(updateWorld, 15);
        };

        this.width = width;
        this.height = height;

        this.addElement = function (element)
        {
            elements.push(element);
            texts.push(element);
        };

        this.removeElement = function (element)
        {
            var tmp = [];
            var i, e;

            for (i = 0; i < elements.length; i++)
            {
                e = elements[i];

                if (e !== element)
                {
                    tmp.push(e);
                }
            }

            elements = tmp;
            texts = [];

            for (i = 0; i < elements.length; i++)
            {
                e = elements[i];
                texts.push(e);
            }
        };

        this.getElements = function ()
        {
            return texts;
        };

        this.resize = function (width, height)
        {
            self.width = width;
            self.height = height;
        };

        this.start = function ()
        {
            updateWorld();
        };

        this.stop = function ()
        {
            clearTimeout(updateId);
        };
    };

    /********************************************/
    /********************************************/
    /***************TEXT FLOW********************/
    /********************************************/
    /********************************************/

    var view = null;
    var world = null;
    var textWriter = null;

    var active = false;

    var start = function ()
    {
        if (!active)
        {
            view.start();
            world.start();
            textWriter.start();

            active = true;
        }
    };

    var stop = function ()
    {
        if (active)
        {
            view.stop();
            world.stop();
            textWriter.stop();

            active = false;
        }
    };

    $.fn.startTextFlow = function ()
    {
        start();
    };

    $.fn.stopTextFlow = function ()
    {
        stop();
    };

    $.fn.textFlow = function (options)
    {
        var viewcase = $(this);
        var textDirection = null;
        var textArray = null;

        var settings = $.extend({
            width: '100%',
            height: '200px',
            top: 0,
            left: 0,
            maxTexts: 15,
            marginTop: 25,
            marginBottom: 0,
            texts: ['Add', 'your', 'own', 'texts', 'here'],
            color: '#000',
            background: 'transparent',
            font: 'sans-serif'
        }, options);


        var initialize = function ()
        {
            var directions = [
                Direction.prototype.directions.east,
                Direction.prototype.directions.west
            ];

            viewcase.css({
                'width': settings.width,
                'height': settings.height,
                'top': settings.top,
                'left': settings.left,
                'position': 'relative'
            });

            if (!(settings.texts instanceof Array))
                throw Error("Texts must be an array");

            textArray = settings.texts;

            textDirection = new Direction(directions);

            world = new World(textDirection, viewcase.outerWidth(), viewcase.outerHeight());
            view = new TextFlowView(settings, viewcase, world, settings.width, settings.height);

            textWriter = new TextWriter(
                settings,
                textDirection,
                world,
                view,
                view.size().width,
                view.size().height,
                settings.marginTop,
                settings.marginBottom,
                settings.maxTexts,
                textArray
            );

            viewcase.startTextFlow();
        };

        initialize();

        $(window).resize(function ()
        {
            view.resize();
            world.resize(viewcase.outerWidth(), viewcase.outerHeight());
            textWriter.resize(view.size().width, view.size().height);
        });

        document.addEventListener('visibilitychange', function ()
        {
            if (active)
            {
                stop();
            }
            else
            {
                start();
            }
        });

        return this;
    };
})(jQuery);