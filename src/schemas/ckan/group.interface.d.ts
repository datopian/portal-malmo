import { Activity } from './activity.interface';
import { Dataset, Tag } from './dataset.interface';
import { User } from './user.interface';
export interface Group {
    display_name: string;
    display_name_translated?: Record<string, string>;
    description: string;
    description_translated?: Record<string, string>;
    image_display_url: string;
    package_count: number;
    created: string;
    name: string;
    is_organization: false;
    state: 'active' | 'deleted' | 'inactive';
    image_url: string;
    type: 'group';
    title: string;
    title_translated?: Record<string, string>;
    revision_id: string;
    num_followers: number;
    id: string;
    approval_status: string;
    packages?: Array<Dataset>;
    activity_stream?: Array<Activity>;
    tags?: Array<Tag>;
    users?: Array<User>;
}
