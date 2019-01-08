/*jslint maxparams: 5, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 6 */

/*global document*/

(function() {

    'use strict'; //Force strict mode

    let
        browserTransitionEvent
    ;

    const

        getBrowserTransitionEvent = () => {
            if(browserTransitionEvent){
                return browserTransitionEvent;
            }

            const
                el = document.createElement("fakeelement"),
                transitions = {
                    "transition"      : "transitionend",
                    "OTransition"     : "oTransitionEnd",
                    "MozTransition"   : "transitionend",
                    "WebkitTransition": "webkitTransitionEnd"
                }
            ;

            let
                t
            ;

            for (t in transitions){
                if (el.style[t] !== undefined){
                    browserTransitionEvent = transitions[t];
                    return browserTransitionEvent;
                }
            }

            throw 'Could not determine transition event';
        },

        create_event = ( name, details ) => {

            details = details || {};

            //IE 9,10,11
            if( document.createEvent ){
                const event = document.createEvent( 'CustomEvent' );
                event.initCustomEvent( name, true, true, details );
                return event;
            }

            if( window.CustomEvent ){
                return new window.CustomEvent( name, { detail: details } );
            }

            return false;
        },

        trigger_event = ( name, details ) =>  {
            const
                event = create_event( name, details ),
                obj = window
            ;

            if( ! event ) {
                return;
            }

            obj.dispatchEvent( event );
        },

        load = () => {

            //Get the browser-specific transition event
            const
                tranEvent = getBrowserTransitionEvent()
            ;

            if(!tranEvent){
                console.error('Could not determine browser transition event, not running box equal helper');
                return;
            }

            document
                //For each of the tabs
                .querySelectorAll('[data-toggle~=tab]')
                .forEach(
                    (tab) => {

                        //Get the target of the tab
                        const
                            href_raw = tab.getAttribute('href') || '',
                            href_parts = href_raw.split('#'),
                            id = href_parts.length === 2 ? href_parts[1] : null,
                            target = document.getElementById(id)
                        ;

                        //Sanity check
                        if(!target){
                            console.log('Target for current tab could not be found... skipping');
                        }

                        //When the target is done transitioning, tell box equal to re-run itself
                        target
                            .addEventListener(
                                tranEvent,
                                () => {
                                    trigger_event('VENDI_BOX_EQUAL_RELOAD');
                                }
                            )
                        ;
                    }
                )
            ;

        },

        init = () => {
            //Standard boot sequence
            if(['complete', 'loaded', 'interactive'].includes(document.readyState)){
                //If the DOM is already set, then just load
                load();
            }else{
                //Otherwise, wait for the readevent
                document.addEventListener('DOMContentLoaded', load);
            }
        }
    ;

    //Kick everything off
    init();
}
()
);
