import { Activity } from './activity.interface';
import { Dataset, Tag } from './dataset.interface';
import { User } from './user.interface';
export interface Organization {
    id: string;
    name: string;
    title: string;
    title_translated?: Record<string, string>;
    display_name: string;
    display_name_translated?: Record<string, string>;
    type: string;
    description?: string;
    description_translated?: Record<string, string>;
    image_url?: string;
    image_display_url?: string;
    created?: string;
    is_organization: boolean;
    package_count: number;
    approval_status?: 'approved';
    state: 'active' | 'inactive' | 'deleted';
    packages?: Array<Dataset>;
    activity_stream?: Array<Activity>;
    users?: Array<User>;
    tags?: Array<Tag>;
}
