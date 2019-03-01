(window["dojoWebpackJsonpnls_bundles_per_locale"] = window["dojoWebpackJsonpnls_bundles_per_locale"] || []).push([["src/widgets/About/About"],{

/***/ "./src/widgets/About/About.m.css":
/*!***************************************!*\
  !*** ./src/widgets/About/About.m.css ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
module.exports = {" _key":"nls-bundles-per-locale/About","root":"About-m__root__KtWsz"};

/***/ }),

/***/ "./src/widgets/About/About.ts":
/*!************************************!*\
  !*** ./src/widgets/About/About.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return About; });
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/I18n */ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _nls__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nls */ "./src/widgets/About/nls/index.ts");
/* harmony import */ var _About_m_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./About.m.css */ "./src/widgets/About/About.m.css");
/* harmony import */ var _About_m_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_About_m_css__WEBPACK_IMPORTED_MODULE_4__);





class About extends Object(_dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_1__["default"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_0__["default"]) {
    render() {
        const { messages } = this.localizeBundle(_nls__WEBPACK_IMPORTED_MODULE_3__["default"]);
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('h1', { classes: [_About_m_css__WEBPACK_IMPORTED_MODULE_4__["root"]] }, [messages.title]);
    }
}


/***/ }),

/***/ "./src/widgets/About/nls/index.ts":
/*!****************************************!*\
  !*** ./src/widgets/About/nls/index.ts ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
    locales: {
        fr: () => __webpack_require__.e(/*! import() | fr */ "fr").then(__webpack_require__.bind(null, /*! ./fr */ "./src/widgets/About/nls/fr/index.ts")),
        de: () => __webpack_require__.e(/*! import() | de */ "de").then(__webpack_require__.bind(null, /*! ./de */ "./src/widgets/About/nls/de/index.ts"))
    },
    messages: {
        title: 'About Page'
    }
});


/***/ })

}]);
//# sourceMappingURL=About.js.map