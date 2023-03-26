
function AABB_collision(position, box_position, box_size) {
    var delta_pos = [];

    vec3.sub(delta_pos, box_position, position);
    console.log(delta_pos);

    return delta_pos[0] < box_size[0] && delta_pos[2] < box_size[2] && delta_pos[0] > 0 && delta_pos[2] > 0;
}