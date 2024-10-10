<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OfUser extends Model
{
    use HasFactory;

    protected $table = 'of_users';

    public $incrementing = true;

    protected $primaryKey = 'id';

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'username',
        'about',
        'short_about',
        'raw_about',
        'avatar',
        'avatar_thumbs',
        'header',
        'header_size',
        'header_thumbs',
        'can_add_subscriber',
        'can_earn',
        'can_pay_internal',
        'can_receive_chat_message',
        'can_trial_send',
        'free_trial_link',
        'favorited_count',
        'favorites_count',
        'has_friends',
        'has_stories',
        'has_stream',
        'has_scheduled_stream',
        'has_not_viewed_story',
        'has_labels',
        'has_links',
        'is_adult_content',
        'is_blocked',
        'is_performer',
        'is_real_performer',
        'is_private_restiction',
        'is_verified',
        'is_restricted',
        'is_friend',
        'join_date',
        'last_seen',
        'location',
        'min_payout_summ',
        'photos_count',
        'medias_count',
        'posts_count',
        'private_archived_posts_count',
        'archived_post_count',
        'has_pinned_posts',
        'show_posts_in_feed',
        'show_subscribers_count',
        'subscribers_count',
        'show_media_count',
        'subscribe_price',
        'subscription_bundles',
        'unprofitable',
        'subscribed_by',
        'subscribed_by_expire',
        'subscribed_by_expire_date',
        'subscribed_by_autoprolong',
        'subscribed_is_expired_now',
        'current_subscribe_price',
        'subscribed_on',
        'subscribed_on_expired_now',
        'subscribed_on_duration',
        'call_price',
        'subscribed_by_data',
        'subscribed_on_data',
        'tips_enabled',
        'tips_text_enabled',
        'tips_max',
        'tips_min',
        'tips_min_internal',
        'videos_count',
        'website',
        'wishlist',
        'date_add',
        'date_last_online',
        'credits_min',
        'credits_max',
        'has_stripe',
        'is_referrer_allowed',
        'is_spotify_connected',
        'is_spring_connected',
        'referal_bonus_summ_for_referer',
        'should_show_finished_streams',
        'finished_streams_count',
        'has_saved_streams',
        'first_published_post_date',
        'can_report',
        'can_look_story',
        'can_comment_story',
        'can_restrict',
        'can_chat',
        'can_promotion',
        'promotions',
        'can_create_promotion',
        'can_create_trial',
        'last_seen_diff',
        'send_invites',
        'date_published',
        'created_at',
        'updated_at',
        'deleted',
        'is_indexed',
        'index_date',
        'onlymodels_sent',
        'priority'
    ];

    protected $casts = [
        'header_size' => 'array',
        'header_thumbs' => 'array',
        'subscription_bundles' => 'array',
        'promotions' => 'array',
    ];

    public $timestamps = true;

    public function swipes(): HasMany
    {
        return $this->hasMany(ModelSwipe::class, 'model_id');
    }
}
