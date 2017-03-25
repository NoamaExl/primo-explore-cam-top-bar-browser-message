(function(){
"use strict";
'use strict';

var browserVersions = {
    'IE': 11,
    'MSIE': 11,
    'Chrome': 54,
    'Safari': 9,
    'Firefox': 49
};

var browserName = {
    'IE': 'Internet Explorer',
    'MSIE': 'Internet Explorer'
};

var secondToRemoveAlert = 8;

app.controller('PrmTopbarAfterController', ['$location', '$mdDialog', '$timeout', '$mdToast', function ($location, $mdDialog, $timeout, $mdToast) {
    var vm = this;

    vm.updateBrowserVersion = function (data) {
        var obj = {};
        if (data) {
            return obj;;
        }
        /* check browser type */
        var ua = navigator.userAgent,
            browser,
            version;
        var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(M[1])) {
            var tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            browser = 'IE';
            version = tem[1];
        }

        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) {
                //tem.slice(1).join(' ').replace('OPR', 'Opera')
                browser = tem.slice(1)[0].replace('OPR', 'Opera');
                version = tem.slice(1)[1];
            }
        }

        if (!version) {
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) {
                M.splice(1, 1, tem[1]);
            }
            browser = M[0];
            version = M[1];
        }
        localStorage.setItem('checkBrowserVersion', true);
        obj.browser = browserName[browser] ? browserName[browser] : browser;
        obj.displayMessage = version && version < browserVersions[browser];
        return obj;
    };

    var browserVersion = vm.updateBrowserVersion(localStorage.getItem('checkBrowserVersion'));
    if (browserVersion.displayMessage) {
        //defualt.nui.browserVersions//iDiscover is optimized for the latest versions of '+browserVersion.browser+'. We recommend you to upgrade to the latest version
        var templateString = '<div layout="row" layout-align="center center" style="width: 100%" class="bar alert-bar layout-align-center-center layout-row">' + '<span class="md-toast-text">' + '<span translate="nui.browseVersions" translate-values="{placeholders:ctrl.getPlaceHolders(\'' + browserVersion.browser + '\')}" translate-compile></span>' + '</span>' + '<md-divider class="md-primoExplore-theme"></md-divider>' + '<button class="md-button md-primoExplore-theme md-ink-ripple" type="button" ng-click="ctrl.onDismiss()" aria-label="DISMISS">' + '<span class="ng-scope" translate="nui.message.dismiss">DISMISS</span>' + '</button>' + '</div>';

        $mdToast.show({
            controllerAs: 'ctrl',
            controller: function controller() {
                this.onDismiss = function () {
                    $mdToast.hide();
                };
                this.getPlaceHolders = function (cur) {
                    var placeHolders = [[{
                        prefix: '',
                        code: cur,
                        tag: { span: ['class=""'] }
                    }]];

                    return placeHolders;
                };
            },
            hideDelay: secondToRemoveAlert * 1000,
            position: 'top right',
            template: templateString
        }).then(function () {
            vm.onToastClose();
        });
    }

    //Following code fixes a bug with mdToast who places "position: relative" on root element but doesn't remove it once it is closed.
    //This causes md-dialog to not display correctly.
    vm.onToastClose = function () {
        angular.element(document.querySelector("primo-explore")).css('position', '');
    };

    vm.$postLink = function () {
        var widgetUrl = $location.search().widgetUrl;
        if (widgetUrl) {
            var DialogController = function DialogController($scope, $mdDialog) {

                $scope.closeDialog = function () {
                   $mdDialog.hide().then(function () {
                        if (window.location.pathname.includes("fulldisplay")) {
                            var mask = angular.element(document.getElementsByClassName('md-scroll-mask'));
                            if (mask && mask.length > 0) {
                                angular.element(document.getElementsByClassName('md-scroll-mask'))[0].remove();
                            }
                        }
                    });
                };
            };

            var parentEl = angular.element(document.body);
            var templateString = '<md-dialog style="width:100%;padding:2em;max-width:500px;" aria-label="List dialog">' + '  <md-dialog-content >' + '   <iframe flex style="border-width:0px;width:100%;min-height:500px" src="' + widgetUrl + '"></iframe>' + '  </md-dialog-content>' + '  <md-dialog-actions>' + '<div flex layout="row" layout-align="center center">' + '       <md-button ng-click="closeDialog()" class="md-primary">' + '       {{"nui.locations.items.widget.close" | translate}}' + '       </md-button>' + '    </div>' + '</md-dialog-actions>' + '</md-dialog>';

            var dialogObj = {
                parent: parentEl,
                /**/
                template: templateString,

                controller: DialogController
            };
            if (window.location.pathname.includes("fulldisplay")) {
                $timeout(function () {
                    $mdDialog.show(dialogObj).then(function () {
                        $location.search('widgetUrl', null);
                    });
                }, 2000);
            } else {
                $mdDialog.show(dialogObj).then(function () {
                    $location.search('widgetUrl', null);
                });
            }
        }
    };
}]);

app.component('prmTopbarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'PrmTopbarAfterController',
    template: '<div ></div>'
});
})();
