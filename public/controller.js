app.controller('transcripts', ['$scope', function($scope) {
  console.log('BOOTED TRANSCRIPT CONTROLLER');
  $scope.ui.transcripts = [];

  $scope.request({
    method: 'get',
    url: '/admin/api/transcripts'
  }).then(function(transcripts) {
    console.log('got transcripts:', transcripts);
    $scope.ui.transcripts = transcripts;
    $scope.$apply();
  }).catch($scope.handleError);




}]);

app.controller('view_transcript', ['$scope', function($scope) {

  console.log('BOOTED SINGLE TRANSCRIPT CONTROLLER');
  if (uid =window.location.href.match(/.*\/transcripts\/(.*)/)) {
    uid = uid[1];
    $scope.ui.user_id = uid;
    
    $scope.request({
      method: 'get',
      url: '/admin/api/transcripts/' + uid
    }).then(function(transcript) {
      console.log('got transcript:', transcript);
      $scope.ui.transcript = transcript;
      $scope.$apply();
    }).catch($scope.handleError);

  }

}]);
