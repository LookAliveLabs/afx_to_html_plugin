<?php
	
	require_once("twitteroauth.php");

	require_once("facebook-sdk/facebook.php");

	define('CONSUMER_KEY', 'lVbg1fVJwn1ParPq9ls4hQ');
	define('CONSUMER_SECRET', 'VPbDRjbnZyJrjA6iWD744Izm8868k6Y1i6vB9Gon8');

	function getFacebook(){
		$facebook = new Facebook(array(
		  'appId'  => '135493243324124',
		  'secret' => 'ae3d17cf4411226ac163e2bd7c2ad249',
		));
		// get token
		// $token = $facebook->getAccessToken;
		// echo $token;
		// echo 'hello';
		// $user = $facebook->getUser();
		// if ($user) {
		  // try {	
		  //   // Proceed knowing you have a logged in user who's authenticated.
		  //   $posts = $facebook->api('/56381779049/posts?access_token=CAACEdEose0cBACTrgFXxMjUJUiTFBRJ2ZCZBYuMAr3N1XUV8SRUXUDfrSDqxfnj48MNyquMfxrRq7aZCtWAU2nsNqYx9LNeV1hmmxVZA5KZCZCNU2tV5tWIUf863DQI276wEHCtDAZByqVexAO6BB7E7lUo5bd6juXzDoW2QzwKuAZDZD');
		  //   echo json_encode($posts);
		  // } catch (FacebookApiException $e) {
		  //   error_log($e);
		  //   $user = null;
		  //   echo ($e);
		  // }
		// }

		$facebook = array(
			"picture"=>"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-frc1/372779_56381779049_1135583157_q.jpg",
			"data"=>array()
		);
		$facebook["data"][0] = array(
			"status-type"=> "added_photos",
			"type"=>"photo",
			"picture"=>"https://photos-b.xx.fbcdn.net/hphotos-ash4/1044198_10151838922099050_882491694_n.jpg",
			"message"=>"The future's so bright we need shades. #LiveForNow",
			"link"=>'https://www.facebook.com/photo.php?fbid=10151838922099050&set=a.123490744049.127432.56381779049&type=1&relevant_count=1',
			"created-time"=>"2013-07-09T16:30:05+0000"
		);
		$facebook["data"][1] = array(
			"status-type"=> "added_photos",
			"type"=>"photo",
			"message"=>"Cases on cases on cases.",
			"link"=>'https://www.facebook.com/photo.php?fbid=10151836465754050&set=a.123490744049.127432.56381779049&type=1&relevant_count=1',
			"created-time"=>"2013-07-08T16:00:08+0000",
			"picture"=>"https://fbcdn-photos-h-a.akamaihd.net/hphotos-ak-prn1/1045018_10151836465754050_1726472156_n.jpg"
		);

		return $facebook;

	}

	function getConnectionWithAccessToken($oauth_token, $oauth_token_secret) {
		  $connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $oauth_token, $oauth_token_secret);
		  return $connection;
	}
	
	function getTwitter(){ 
		$connection = getConnectionWithAccessToken("1490669028-1pM1dyVHXljEzktIay4mIuXUw1gcHURKaPNaKQn", "xDCksAzKINoNAO2cr2XUalgt9LuiozjtUNHXuIFYM8");
		$content = $connection->get("search/tweets", array('q' => '#pepsi', 'result_type'=>'mixed', 'count'=>10) );
	
		// echo json_encode($content->statuses);
		$out = array();

	    foreach ( $content->statuses as $status){
	    	$data = array();
	    	$data['text'] = $status->text;
			$data['user_name'] = $status->user->name;
			$data['screen_name'] = '@'.$status->user->screen_name;
			$data['user_image'] = $status->user->profile_image_url;
			$data['date'] = $status->created_at;
	    	
	    	array_push($out, $data);
	    }
	    return $out;
	}

	function getInstagram(){
		$feed_url =  'https://api.instagram.com/v1/tags/pepsi/media/recent?access_token=252755417.c773902.24b8e27339234b308629082a7f71228a&count=100';
		// $feed_url =  'https://api.instagram.com/v1/tags/search?q=pepsi&access_token=252755417.f59def8.2529f163ba8948638cdd67b1bb0f3353';

		$json = file_get_contents($feed_url);
	    $json_output = json_decode($json,true);

	    $out = array();
	    foreach ( $json_output['data'] as $entry){
	    	// echo json_encode($entry).'<br/><br/><br/>';
	    	$data = array();
	    	$data['href'] = $entry['images']['low_resolution']['url'];
			$data['user'] = 'user'.$entry['user']['id'];
			$data['caption'] = $entry['caption']['text'] ? $entry['caption']['text'] : '';
			$data['user_id'] = $entry['caption']['from']['id'] ? $entry['caption']['from']['id']: '';
			$data['user_name'] = $entry['caption']['from']['username'] ? $entry['caption']['from']['username'] : '';

	    	
	    	array_push($out, $data);
	    }

	    return $out;

	}
	$data = array();
	$data['instagram'] = getInstagram();
	$data['twitter'] = getTwitter();
	$data['facebook'] = getFacebook();

	// (1) save data in json file
	$file_path = '/Users/mashabelyi/Sites/AfxToHtml/data.json';
	file_put_contents($file_path, json_encode($data));
	// echo "done";
?>