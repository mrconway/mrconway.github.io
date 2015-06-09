<script>
var EndaiGaEventTracker = {
	debug_enabled: true,
	prevent_enabled: false,
	control_attr: "gaEventTrack",
	config: {
		"sections" : {},
		"selectors":["a", ":button", ":input", "form"]
	},

	setSections: function(sections) {
		EndaiGaEventTracker.config.sections = sections;
	},

	toDataLayer: function (element, event, category, action_type) {
		var action = EndaiGaEventTracker.getActionName(element, action_type);
		var label =  jQuery(element).attr('href');
		//based on macro -- do not chage it
		var eventName = 'endaiGAevent';
		if(EndaiGaEventTracker.debug_enabled) {
			console.log("Action: %s of category: %s", action, category);
		}
		
		return {
		    		'event': eventName, 
		    		'eventCategory': category, 
		    		'eventAction': action,
		    		'eventLabel': label
		};
	},

	getImgAttr: function(img) {
		var attrs = ["alt","title","src"];
		var s = "";
		jQuery.each(attrs,function(k,attr_label){
			var t = jQuery(img).attr(attr_label);
			//console.log("t: %s",t);
			if(t && t!="") {
				if(attr_label == "src") {
					t = t.split('/').reverse()[0];
					//t = t.split('.')[0];
				}
				s = " ["+t+"]";
				return false;
			}
		});
		return s;
	},

	getTextAttr: function(element, type) {
		var attrs = ["title","name", "id"];
		var s = jQuery.trim(jQuery(element).text());
		if(s == "" || type == "INPUT" || type=="SELECT" || type=="FORM") {
			jQuery.each(attrs,function(k,attr_label){
			var t = jQuery(element).attr(attr_label);
			
			if(t && t!="") {
				s = " ["+t+"]";
				return false;
			}
			});
		} else {
			s = "["+s+"]";
		}

		return s;
	},

	getActionName: function(element, action_type) {

		var s = action_type + ' on';
		var type = jQuery(element).get(0).tagName;
		if(EndaiGaEventTracker.debug_enabled) {
			console.log("Found type: %s",type);
		}
		var clicked_on = "";

		var imgs = jQuery(element).children("img:first");
		if(imgs.length > 0) { //lets try to get alt, title or src
			jQuery.each(imgs,function(k,img){
				var text = EndaiGaEventTracker.getImgAttr(img);
				if(text) {
					s += text;
					return false;
				}
			});
		} else {
			s += " "+EndaiGaEventTracker.getTextAttr(element,type);
		}

		switch(type) {
			case "BUTTON":
				s += ' button link';
			break;
			case "INPUT":
				s += ' input'
			break;
			case "SELECT":
				s += ' select'
			break;
			case "FORM":
				s += ' form'
			break;
			default:
				s += (imgs.length > 0)? ' image link':' text link';
			break;
		}
		

		return s;
	},
	getSelect: function(section) {
		if(typeof section === "undefined") {
			return "";
		}
		var select_statement = [];
		jQuery.each(EndaiGaEventTracker.config.selectors,function(k,v) {
				var vs = section.split(',');
				if(vs.length > 0) {
					jQuery.each(vs,function(k,part){
						select_statement.push(part+" "+v);
					});
				} else {
					select_statement.push(section+" "+v);
				}
				
		});
		return select_statement.join()
	},
	track: function(one_section) {
		var sectionstotrack = (typeof one_section === "undefined")? EndaiGaEventTracker.config.sections:one_section;
		jQuery.each(sectionstotrack,function(category,section) { //for each section
			
			var mysection = EndaiGaEventTracker.getSelect(section);
			if(EndaiGaEventTracker.debug_enabled) {
				console.log("doing section: %s",mysection);
			}
			if(mysection == "") {
				return true;
			}
			jQuery(mysection) //get all elements that we need

				.each(function(i,v) { //for each element bind click event
					if(EndaiGaEventTracker.debug_enabled) {
						console.log("Found index %s and value %o",i,v);
					}
					if(jQuery(v).get(0).tagName == "FORM") {
						if(jQuery(v).attr(EndaiGaEventTracker.control_attr) == 1) {
							return true;
						}
						jQuery(v).submit(function(event) {
							if(EndaiGaEventTracker.debug_enabled && EndaiGaEventTracker.prevent_enabled) {
								event.preventDefault(); //tme to debug
							}

							dataLayer.push(EndaiGaEventTracker.toDataLayer(this, event, category, "submit"));
							if(EndaiGaEventTracker.debug_enabled) {
								console.log("dataLayer contains %o",dataLayer);
							}

						});
						jQuery(v).attr(EndaiGaEventTracker.control_attr,"1");
						return true;
					}

					if(jQuery(v).get(0).tagName != "INPUT" && jQuery(v).get(0).tagName != "SELECT") {
						if(jQuery(v).attr(EndaiGaEventTracker.control_attr) == 1) {
							return true;
						}
						jQuery(v).click(function(event) {
							if(EndaiGaEventTracker.debug_enabled && EndaiGaEventTracker.prevent_enabled) {
								event.preventDefault(); //tme to debug
							}

							dataLayer.push(EndaiGaEventTracker.toDataLayer(this, event, category, "click"));
							if(EndaiGaEventTracker.debug_enabled) {
								console.log("dataLayer contains %o",dataLayer);
							}
						});
						jQuery(v).attr(EndaiGaEventTracker.control_attr,"1");
					} else {
						if(jQuery(v).attr('type') == 'hidden') {
							return true;
						}
						if(jQuery(v).attr(EndaiGaEventTracker.control_attr) == 1) {
							return true;
						}
						if(jQuery(v).attr('type') == 'submit') {
							//we do not track submits anymore
							return true;
							jQuery(v)
							.click(function(event) {
								if(EndaiGaEventTracker.debug_enabled && EndaiGaEventTracker.prevent_enabled) {
									event.preventDefault(); //tme to debug
								}

								dataLayer.push(EndaiGaEventTracker.toDataLayer(this, event, category, "click"));

								if(EndaiGaEventTracker.debug_enabled) {
									console.log("dataLayer contains %o",dataLayer);
								}
							});
							jQuery(v).attr(EndaiGaEventTracker.control_attr,"1");
							return true;
						}

						jQuery(v)
						.change(function(event) {
							if(EndaiGaEventTracker.debug_enabled && EndaiGaEventTracker.prevent_enabled) {
								event.preventDefault(); //tme to debug
							}

							dataLayer.push(EndaiGaEventTracker.toDataLayer(this, event, category, "change"));

							if(EndaiGaEventTracker.debug_enabled) {
								console.log("dataLayer contains %o",dataLayer);
							}
						});
						jQuery(v).attr(EndaiGaEventTracker.control_attr,"1");
					}
					
			});
		});
	}
}
jQuery(document).ready(function() {
console.log("document ready, in Endai Listener");

var sections = {
//*****************Universal********************// 
'Header'                        : '.utility-nav', //pass
'Main Navigation'               : '.main-nav', //pass
'Footer'                        : '#footer-wrap', //pass

//*****************Homepage********************// 
'Message Widget'                : '#hz-spiffs', //pass
'Hero'                          : '#fullsize-image', 

//*****************Email Pop Up********************// 
'Email Pop Up'			        : '#email-popup',

//*****************Category Page********************// 
'Filter Products'               : '.filter-wrapper', //pass
'Product List'                  : '#product-grid', //pass
'Sub Navigation'                : '#filter-nav-wrap, #secondary-nav', //fail
'Main Content Block'            : '.section-title, #showmore, #showseo, #showless, .clearseo2', //pass

//*****************Product Pop Up********************// 
//'Product Images Pop-Up'         : '',                      
//'Product Options Pop-Up'        : '',

//*****************Collection Page********************// 
'Hero Slider'                   : '#slider', //pass
//'Main Content Block'            : '.section-title, .showmore, #showseo, #showless, .clearseo2', //see key above //pass
'Collection List'		        : '.products-list.three-cols', //pass
'Breadcrumbs'                	: 'ul.breadcrumbs', //pass

//*****************Group Product Page********************// 
//'Breadcrumb'                	: 'ul.breadcrumbs', //see key above //pass
//'Product Images'  				: '#product-images, .grouped-product-image', //see key below //pass
//'Product Images'  				: '#product-images, .view-larger-button, .more-views', //need to test
//'Group Product Listing'  		: '#product_addtocart_form', //need to test (will rely on rules not categories)
//'Product Add'     				: '(.add-to-cart, .shop-button.single-item.btn-cart, .grouped-add-to).not(.view-details, li.quantity-wrap)', //need to test
//'Product Share'					: '.socials',//pass
//'Product Suggestion'			: '.you-may-also-like',//pass

//*****************Product Page********************// 
//'Breadcrumb'                	: 'ul.breadcrumbs', //see key above //pass
'Product Images'  				: '#product-images, .view-larger-button, .more-views', //pass
//'Product Videos'				   	: '',
//'Product Details' 				: '',
'Product Options'  				: '.product-info.product-type-configurable, .product-info.product-type-grouped',
//'Product Quantity'  			: 'li.quantity-wrap',//pass
//'Product Add'     				: '(.add-to-cart, .shop-button.single-item.btn-cart, .grouped-add-to).not(.view-details, li.quantity-wrap)',//fail
//'Product Share'					: '.socials',//pass
//'Product Reviews'				: '',
'Product Suggestion'			: '.you-may-also-like',//pass

//*****************Cart Page********************// 
'Cart-Empty'   			        : '.cart-empty', //pass
'Cart'   					    : '.cart', //pass

//*****************Wishlist Page********************// 
//'Sub Navigation'                : '#filter-nav-wrap, #secondary-nav', //see key above
'My Wishlist'   			     : '.my-wishlist',


//*****************Sign-in Pages********************// 
'Sign-in'   			        : '.account-login, .account-create, #login',

//*****************unique Pages********************// 
'Lookbook'   			        : '.center-box.center-box-press',
'Request a Catalog'   			: '#catalogRequestForm',


//*****************Checkout Funnel Pages********************
//'Checkout-All Events'          	: '#checkout',
'Checkout-Selection'          	: '#sidebar',
'Checkout-Bill Address'      	: '#co-billing-form',
'Checkout-Ship Address'      	: '#shipping-new-address-form .checkbox-wrapper',
'Checkout-Ship Method'      	: '#checkout-shipping-method-load, #onepage-checkout-shipping-method-additional-load',
'Checkout-Credit Card'      	: '#payment_form_authorizenetcim',
'Checkout-Coupon Code'      	: '#discount-coupon-form',
'Checkout-Co-Opt-In'      	    : '#co-newsletter-form'
//Time based pop not included
//review order page

//*****************Order Confirmation Pages********************//

//*****************Uncategorized********************// 
//'Other'        : ''
};

EndaiGaEventTracker.setSections(sections);
EndaiGaEventTracker.track();
        jQuery("#fancybox-wrap").bind("DOMSubtreeModified",function(){
		EndaiGaEventTracker.track({"Quickshop Dialog":"#fancybox-content"});
	})

});
</script>