import isMobile from 'ismobilejs';

export default class Helpers
{

    static isMobile()
    {
        // viewport width based and using isMobile library
        if( window.innerWidth < 750 || isMobile.phone ) { return true; }
        return false;
    }

    static isTablet()
    {
        return isMobile.tablet;   
    }

    static isTouch()
    {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    } 

    static isMobile()
    {
        return isMobile.phone;
    }

    static isTablet()
    {
        return isMobile.tablet;   
    }

    static isTouch()
    {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }

    static fadeOut(el)
    {
        el.style.opacity = 1;
        (function fade()
        {
            if ((el.style.opacity -= .1) < 0)
            {
                el.style.display = "none";
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }

    static fadeIn(el)
    {
        el.style.opacity = 0;
        el.style.display = "block";
        (function fade()
        {
            var val = parseFloat(el.style.opacity);
            if (!((val += .1) > 1))
            {
                el.style.opacity = val;
                requestAnimationFrame(fade);
            }
        })();
    }

    static scrollTo(element, duration)
    {
        let to = (element.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop),
            from = ((document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop),
            by = (to-from),
            currentIteration = 0,
            animIterations = Math.round(60 * (duration/1000)); 
            console.log(to,from,by);
        (function scroll()
        {
            let value = Math.round(Helpers.easeInOutCirc(currentIteration, from, by, animIterations));
            document.documentElement.scrollTop = document.body.scrollTop = value;
            currentIteration++;
            if (currentIteration < animIterations)
            {
                requestAnimationFrame(scroll);
            }    
        })();
    }
    static linearEase(t, b, c, d) { return c * t / d + b; }
    static easeOutCubic(t, b, c, d) { return c * (Math.pow(t / d - 1, 3) + 1) + b; }
    static easeInOutCirc(t, b, c, d) { t /= d/2; if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b; t -= 2; return c/2 * (Math.sqrt(1 - t*t) + 1) + b; };


    static fixMobileHeightInit()
    {
        /* on apple devices fix height bug (https://nicolas-hoizey.com/2015/02/viewport-height-is-taller-than-the-visible-part-of-the-document-in-some-mobile-browsers.html) */
        if( Helpers.isMobile() || Helpers.isTablet() )
        {
            Helpers.fixMobileHeight();
            Helpers.onResizeHorizontal(Helpers.fixMobileHeight);
        }
    }
    static fixMobileHeight()
    {
        // do some manual work here
        document.querySelector('.full-height-item').style.height = window.innerHeight+'px';
    }

    static onResizeHorizontal(fun)
    {
        var windowWidth = window.innerWidth;
        window.addEventListener('resize', () =>
        {
            var windowWidthNew = window.innerWidth;
            if(windowWidthNew != windowWidth)
            {
                windowWidth = windowWidthNew;
                fun();
            }
        });
    }

    static onResizeVertical(fun)
    {
        var windowHeight = window.innerHeight;
        window.addEventListener('resize', () =>
        {
            var windowHeightNew = window.innerHeight;
            if(windowHeightNew != windowHeight)
            {
                windowHeight = windowHeightNew;
                fun();
            }
        });
    }

}