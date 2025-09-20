/**
 * @param {number[]} nums
 * @return {number[][]}
 */
const threeSum = function (nums) {
  const res = [];
  nums.sort((a, b) => a - b); // in-place sort

  for (let i = 0; i < nums.length - 2; i++) {
    // skip duplicate anchors
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        res.push([nums[i], nums[left], nums[right]]);

        // move both pointers and skip duplicates on both sides
        left++;
        while (left < right && nums[left] === nums[left - 1]) left++;

        right--;
        while (left < right && nums[right] === nums[right + 1]) right--;
      } else if (sum < 0) {
        left++; // need a bigger sum
      } else {
        right--; // need a smaller sum
      }
    }
  }

  return res;
};

threeSum([-2, 0, 1, 1, 2]); // [-4,-1,-1,0,1,2]
