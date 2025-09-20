/**
 * Calculates the total amount of trapped rain water given an elevation map.
 * @param {number[]} height - Array representing the elevation map.
 * @return {number} - Total units of trapped water.
 */
const trap = function(height) {
    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let waterTrapped = 0;

    // Two-pointer approach to find trapped water
    while (left < right) {
        if (height[left] < height[right]) {
            // Water trapped depends on leftMax
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                waterTrapped += leftMax - height[left];
            }
            left++;
        } else {
            // Water trapped depends on rightMax
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                waterTrapped += rightMax - height[right];
            }
            right--;
        }
    }

    return waterTrapped;
};

trap([4,2,0,3,2,5]);
