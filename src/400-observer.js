/*jslint maxparams: 5, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 6 */

/*global document*/

(function() {

    'use strict'; //Force strict mode

    const

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

        watch_dom = () => {

            const
                config = { attributes: true },
                observer = new MutationObserver(
                    (mutationsList, observer) => {
                        mutationsList
                            .forEach(
                                (mutation) => {
                                    if(mutation.type !== 'attributes') {
                                        return;
                                    }

                                    if(mutation.attributeName === 'aria-expanded') {
                                        trigger_event('VENDI_BOX_EQUAL_RELOAD');
                                    }

                                }
                            )
                        ;
                    }
                )
            ;

            document
                .querySelectorAll('[data-toggle~=tab]')
                .forEach(
                    (tab) => {
                        observer.observe(tab, config);
                    }
                )
            ;

        },

        load = () => {
            watch_dom();
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
