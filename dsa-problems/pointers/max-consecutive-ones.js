/**
 * Finds the longest subarray containing at most k zeros.
 * Uses a sliding window approach to efficiently track the window.
 *
 * @param {number[]} nums - Array of binary digits (0s and 1s).
 * @param {number} k - Maximum number of zeros allowed in the subarray.
 * @return {number} - Length of the longest valid subarray.
 */
var longestOnes = function(nums, k) {
    let left = 0;      // Left pointer of the sliding window
    let zeros = 0;     // Number of zeros in the current window
    let best = 0;      // Length of the longest valid window found

    // Expand the window by moving the right pointer
    for (let right = 0; right < nums.length; right++) {
        // If current element is zero, increment zeros count
        if (nums[right] === 0) zeros++;

        // If zeros exceed k, shrink the window from the left
        while (zeros > k) {
            if (nums[left] === 0) zeros--;
            left++; // Move left pointer to the right
        }

        // Update the best length found so far
        best = Math.max(best, right - left + 1);
    }

    return best;
};