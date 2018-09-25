/*jslint white: true, browser: true, plusplus: true, esversion: 6*/

/*global window, document*/

/**
 * Equalizes heights of boxes on a given page. Each element should have their
 * data-box-equal property set to a common value to equalize to. If there are
 * more than one set of groups then each group should use their own unique group
 * identifier (similar to radio button groups):
 *
 * <div data-box-equal="group-1" data-box-equal-width-disable="">Hello</div>
 * <div data-box-equal="group-1">World</div>
 * <div data-box-equal="group-2">Different</div>
 * <div data-box-equal="group-2">Set</div>
 *
 * Additionally you may set a global function variable called windows.custom_box_equal_selector
 * that returns an array of items with the above rules in place.
 *
 * @version  4.0.0
 *
 * @history  1.0.0 - Initial version, required manual invocation.
 *           2.0.0 - Added automatic invocation looking for a custom CSS class and custom data-* attribute.
 *           3.0.0 - Removed custom CSS class, now just searching on custom data-* attribute.
 *                 - Added global override function
 *           4.0.0 - Removed IE7 support
 *                 - Removed Bob's crazy three spaces
 *                 - Added ability to turn off at certain widths
 *
 */

(function( )
{
    'use strict';                         //Force strict mode

    var

        get_boxes = function()
        {
            //If there is a function attached to the window object called custom_box_equal_selector
            //then that function will be invoked instead of the regular QSA version.
            //TODO: We should probably merge the two instead.
            if(window && window.custom_box_equal_selector && 'function' === typeof window.custom_box_equal_selector){
                return window.custom_box_equal_selector();
            }

            return document.querySelectorAll( '[data-box-equal]' );
        },

        get_viewport_width = function()
        {
            return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        },

        /**
         * Equalize the heights of the given items.
         */
        equalizeHeights = function( items )
        {
            var
                maxHeight = 0,
                disable_width = false,
                i
            ;

            for( i = 0; i < items.length; i++ ){
                if(items[i].hasAttribute('data-box-equal-width-disable')){
                    disable_width = parseInt(items[i].getAttribute('data-box-equal-width-disable'));
                    break;
                }
            }

            //Calculate the maximum height
            for( i = 0; i < items.length; i++ ){

                items[i].style.zoom = 1;
                //Reset the height to auto so that we can handle the resize logic
                items[i].style.height = 'auto';

                maxHeight = Math.max( maxHeight, items[i].clientHeight );
            }

            if(false !== disable_width){
                if(get_viewport_width() <= disable_width){
                    return;
                }
            }

            //Apply the maximum height
            for( i = 0; i < items.length; i++ ){
                items[i].style.height = maxHeight + 'px';
            }
        },

        /**
         * Search for elements with a class of .box-equal to equalize heights.
         */
        onload = function()
        {
            var
                //Grab each element with this specific class
                boxes = get_boxes(),
                items = [],
                i, j,
                id,
                obj
            ;

            //Loop through each element found
            for( i = 0; i < boxes.length; i++ ){

                //We're going to set this variable to either an existing
                //object or we're create a new one. Null it out here
                //each time to start with
                obj = null;

                //Grab our specific data attribute which acts the name attribute
                //of a radio button.
                id = boxes[ i ].getAttribute( 'data-box-equal' );

                //Make sure it is set
                if( null === id || '' === id ){
                    continue;
                }

                //Loop through each previously created custom object
                for( j = 0; j < items.length; j++){

                    //If we found it set our function level variable and
                    //break out of the inner loop
                    if( id === items[ j ].id ){
                        obj = items[ j ];
                        break;
                    }
                }

                //We didn't find our custom local object, create a new one
                if( null === obj ){

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
            for( i = 0; i < items.length; i++ ){
                equalizeHeights( items[ i ].nodes );
            }
        },

       /**
        * Called immediately after this JS block is loaded.
        *
        * NOTE: If this script is loaded in <head> the DOM might not be ready so
        * this should always delay until DOMContentLoaded
        *
        * @param  {string|array} params Either a single selector or an array of selectors.
        */
        init = function( )
        {
            //We don't support IE7 or less
            if( ! document.querySelectorAll ){
                return;
            }

            //Always handle resize
            window.addEventListener('resize', onload);

            if(document.readyState && ('complete' === document.readyState || 'loaded' === document.readyState)){
                //If the document is already loaded then manually fire the load event
                onload();
            }else{
                //Otherswise delay it until we are loaded
                document.addEventListener('DOMContentLoaded', onload);
            }

            //There was a click handler here previously, not sure why?
            // window.addEventListener('click', onload);
      }
    ;

    //Kick everything off
    init( );
}());
