/*jslint white: true, browser: true, plusplus: true, esversion: 6*/

/*global window, document*/

/**
 * Equalizes heights of boxes on a given page. Each element should have their
 * data-box-equal property set to a common value to equalize to. If there are
 * more than one set of groups then each group should use their own unique group
 * identifier (similar to radio button groups):
 *
 * <div data-box-equal="group-1">Hello</div>
 * <div data-box-equal="group-1">World</div>
 * <div data-box-equal="group-2">Different</div>
 * <div data-box-equal="group-2">Set</div>
 *
 * Additionally you may set a global function variable called windows.custom_box_equal_selector
 * that returns an array of items with the above rules in place.
 *
 * @version  3.0.0
 *
 * @history  1.0.0 - Initial version, required manual invocation.
 *           2.0.0 - Added automatic invocation looking for a custom CSS class and custom data-* attribute.
 *           3.0.0 - Removed custom CSS class, now just searching on custom data-* attribute.
 *                 - Added global override function
 *
 */

(function( )
{
    'use strict';                         //Force strict mode

    var

        /*!
         * contentloaded.js
         *
         * Author: Diego Perini (diego.perini at gmail.com)
         * Summary: cross-browser wrapper for DOMContentLoaded
         * Updated: 20101020
         * License: MIT
         * Version: 1.2
         *
         * URL:
         * http://javascript.nwbox.com/ContentLoaded/
         * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
         *
         * //From: https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
         *
         */
        createOnReadyEvent = function( fn, win  )
        {
            win = win || window;

            var
                done = false,
                top = true,

                doc = win.document,
                root = doc.documentElement,
                modern = doc.addEventListener,

                add = modern ? 'addEventListener' : 'attachEvent',
                rem = modern ? 'removeEventListener' : 'detachEvent',
                pre = modern ? '' : 'on',

                init = function( e )
                {
                    if ( e.type == 'readystatechange' && doc.readyState != 'complete' )
                    {
                        return;
                    }

                    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);

                    if (!done && (done = true)) fn.call(win, e.type || e);
                },

                poll = function()
                {
                    try
                    {
                        root.doScroll( 'left' );
                    }
                    catch( e )
                    {
                        setTimeout( poll, 50 );
                        return;
                    }

                    init( 'poll' );
                }
            ;

            if ( doc.readyState == 'complete' )
            {
                fn.call( win, 'lazy' );
            }
            else
            {
                if ( ! modern && root.doScroll )
                {
                    try
                    {
                        top = ! win.frameElement;
                    }
                    catch( e )
                    {
                        //NOOP
                    }

                    if (top)
                    {
                        poll();
                    }
                }

                doc[add](pre + 'DOMContentLoaded', init, false);
                doc[add](pre + 'readystatechange', init, false);
                win[add](pre + 'load', init, false);
            }
        },

        /**
         * Cross browser event handler.
         */
        addEvent = window.addEventListener ?
                    function (elem, type, method)
                    {
                        elem.addEventListener(type, method, false);
                    }
                    :
                    function (elem, type, method)
                    {
                        elem.attachEvent('on' + type, method);
                    },

        /**
         * Equalize the heights of the items of the given selector.
         * @param  {string} selector A standard JavaScript/jQuery selector.
         */
        equalizeHeights = function( items )
        {
            var
                maxHeight = 0,
                i
            ;

            //Calculate the maximum height
            for( i = 0; i < items.length; i++ )
            {
                items[i].style.zoom = 1;
                //Reset the height to auto so that we can handle the resize logic
                items[i].style.height = 'auto';

                maxHeight = Math.max( maxHeight, items[i].clientHeight );
            }

            //Apply the maximum height
            for( i = 0; i < items.length; i++ )
            {
                items[i].style.height = maxHeight + 'px';
            }
        },

        /**
         * Create a document.querySelectorAll for IE7
         */
        createLegacyQSA = function()
        {
            /**
             * define document.querySelector & document.querySelectorAll for IE7
             *
             * A not very fast but small hack. The approach is taken from
             * http://weblogs.asp.net/bleroy/archive/2009/08/31/queryselectorall-on-old-ie-versions-something-that-doesn-t-work.aspx
             *
             */
            (
                function ()
                {
                    var
                        style = document.createStyleSheet(),
                        select =    function (selector, maxCount)
                                    {
                                        var
                                            all = document.all,
                                            l = all.length,
                                            i,
                                            resultSet = []
                                        ;

                                        style.addRule(selector, "foo:bar");
                                        for (i = 0; i < l; i += 1)
                                        {
                                            if (all[i].currentStyle.foo === "bar")
                                            {
                                                resultSet.push(all[i]);
                                                if (resultSet.length > maxCount)
                                                {
                                                    break;
                                                }
                                            }
                                        }
                                        style.removeRule(0);
                                        return resultSet;

                                    }
                    ;

                    //  be rly sure not to destroy a thing!
                    if (document.querySelectorAll || document.querySelector)
                    {
                        return;
                    }

                    document.querySelectorAll = function (selector)
                                                {
                                                    return select(selector, Infinity);
                                                };

                    document.querySelector =    function (selector)
                                                {
                                                    return select(selector, 1)[0] || null;
                                                };
                }
            ()
            );
        },

        /**
         * Search for elements with a class of .box-equal to equalize heights.
         */
        onload = function()
        {
            var
                //Grab each element with this specific class
                boxes = ( window && window.custom_box_equal_selector ? window.custom_box_equal_selector() : document.querySelectorAll( '[data-box-equal]' ) ),
                items = [],
                i, j,
                id,
                obj
            ;

            //Loop through each element found
            for( i = 0; i < boxes.length; i++ )
            {

            //We're going to set this variable to either an existing
            //object or we're create a new one. Null it out here
            //each time to start with
            obj = null;

            //Grab our specific data attribute which acts the name attribute
            //of a radio button.
            id = boxes[ i ].getAttribute( 'data-box-equal' );

            //Make sure it is set
            if( null === id || '' === id )
            {
                continue;
            }

            //Loop through each previously created custom object
            for( j = 0; j < items.length; j++)
            {
               //If we found it set our function level variable and
               //break out of the inner loop
               if( id === items[ j ].id )
               {
                  obj = items[ j ];
                  break;
               }
            }

            //We didn't find our custom local object, create a new one
            if( null === obj )
            {
               obj = {};
               //Id will be the contents of the data-box-equal HTML attribute
               obj.id = id;

               //Nodes is an array of each element
               obj.nodes = [];

               //Push onto our collection
               items.push( obj );
            }

            //Obj should now always be set. Push this specific
            //node onto the collection of nodes for this specific "id"
            obj.nodes.push( boxes[ i ] );

         }

         //The above is basically just a giant sorter and combiner.

         //Loop through each item and set the contents of each item's nodes to
         //be the same height.
         for( i = 0; i < items.length; i++ )
         {
            equalizeHeights( items[ i ].nodes );
         }
      },

      /**
       * Called immediately after this JS block is loaded.
       *
       * NOTE: The DOM might not be ready, this should always use addEvent.
       *
       * @param  {string|array} params Either a single selector or an array of selectors.
       */
      init = function( )
      {
         //We require this, won't work in IE7 or less
         if( ! document.querySelectorAll )
         {
            createLegacyQSA();
         }

         //Bind a load and resize event to actually process our items. Heights aren't always 100% correct until after load
         //createOnReadyEvent( onload );
         addEvent( window, 'load',   onload );
         addEvent( window, 'resize', onload );
         addEvent( window, 'click', onload );
      }
   ;

   //Kick everything off
   init( );
}());
