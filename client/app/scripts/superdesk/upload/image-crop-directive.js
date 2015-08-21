define([
    'lodash',
    'bower_components/jcrop/js/jquery.Jcrop'
], function(_) {
    'use strict';

    return ['notify', 'gettext', '$timeout', function(notify, gettext, $timeout) {
        return {
            scope: {
                src: '=',
                cords: '=',
                progressWidth: '=',
                boxWidth: '=',
                boxHeight: '=',
                aspectRatio: '=',
                minimumSize: '=',
                cropSelect: '=',
                showMinSizeError: '='
            },
            link: function(scope, elem) {

                var bounds, boundx, boundy;
                var rwidth, rheight;
                var minimumSize, updateTimeout;
                var cropSelect = [];

                minimumSize = scope.minimumSize ? scope.minimumSize : [200, 200];
                cropSelect = scope.cropSelect ? getCropSelect(scope.cropSelect) : [0, 0, scope.boxWidth, scope.boxHeight];

                /**
                * Push value in clockwise sequence from Left, Top, Right then Bottom (L-T-R-B).
                */
                function getCropSelect(cropImage) {
                    cropSelect.length = 0;

                    cropSelect.push(cropImage.CropLeft);
                    cropSelect.push(cropImage.CropTop);
                    cropSelect.push(cropImage.CropRight);
                    cropSelect.push(cropImage.CropBottom);

                    return cropSelect;
                }

                console.log('eval=' + scope.aspectRatio);
                console.log('minSize=' + minimumSize);
                console.log('cropSelect=' + cropSelect);

                // To adjust preview box as per aspect ratio
                if (scope.aspectRatio.toFixed(2) === '1.33') {
                    rwidth = 300; rheight = 225;
                } else if (scope.aspectRatio.toFixed(2) === '1.78') {
                    rwidth = 300; rheight = 169;
                } else {
                    rwidth = 300; rheight = 300;
                }

                var updateFunc = function(c) {
                    cancelTimeout(c);
                    updateTimeout = $timeout(updateScope(c), 300, false);
                };

                function cancelTimeout(event) {
                    $timeout.cancel(updateTimeout);
                }

                function updateScope(c) {
                    scope.$apply(function() {
                        scope.cords = c;
                        var rx = rwidth / scope.cords.w;
                        var ry = rheight / scope.cords.h;
                        showPreview('.preview-target-1', rx, ry, boundx, boundy, scope.cords.x, scope.cords.y);
                    });
                }

                function showPreview(e, rx, ry, boundx, boundy, cordx, cordy) {
                    $(e).css({
                        width: Math.round(rx * boundx) + 'px',
                        height: Math.round(ry * boundy) + 'px',
                        marginLeft: '-' + Math.round(rx * cordx) + 'px',
                        marginTop: '-' + Math.round(ry * cordy) + 'px'
                    });
                }

                function validateConstraints(imgObj) {
                    if (imgObj.width < minimumSize[0] || imgObj.height < minimumSize[1]) {
                        scope.$apply(function() {
                            notify.pop();
                            notify.error(gettext('Sorry, but image must be at least ' + minimumSize[0] + 'x' + minimumSize[1]));
                            scope.src = null;
                            scope.progressWidth = 0;
                            scope.$parent.preview.progress = null;
                        });
                        return;
                    }
                }

                scope.$watch('src', function(src) {
                    elem.empty();
                    if (src) {
                        var img = new Image();
                        img.onload = function() {
                            scope.progressWidth = 80;
                            scope.$parent.preview.progress = true;
                            var size = [this.width, this.height];

                            if (scope.showMinSizeError) {
                                validateConstraints(this);
                            }

                            elem.append(img);
                            $(img).Jcrop({
                                aspectRatio: scope.aspectRatio,
                                minSize: minimumSize,
                                trueSize: size,
                                boxWidth: scope.boxWidth,
                                boxHeight: scope.boxHeight,
                                //setSelect: [0, 0, scope.boxWidth, scope.boxHeight],
                                setSelect: cropSelect,
                                allowSelect: false,
                                addClass: 'jcrop-dark',
                                onChange: updateFunc
                            }, function() {
                                bounds = this.getBounds();
                                boundx = bounds[0];
                                boundy = bounds[1];
                            });
                            scope.progressWidth = 0;
                        };
                        img.src = src;
                    }
                });
            }
        };
    }];
});
