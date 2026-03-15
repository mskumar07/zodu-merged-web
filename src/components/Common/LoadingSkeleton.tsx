// components/dashboard/DashboardSkeleton.tsx (Updated with pagination skeleton)
import { Skeleton, Stack, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

const DashboardSkeleton = () => {
  return (
    <Box>
      <Grid container spacing={3} alignItems="stretch">
        {/* LEFT */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Metric cards */}
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Skeleton
                    variant="rectangular"
                    height={90}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Recent Orders */}
            <Skeleton
              variant="rectangular"
              height={260}
              sx={{ borderRadius: 2 }}
            />

            {/* Bottom cards */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton
                  variant="rectangular"
                  height={220}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton
                  variant="rectangular"
                  height={220}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* RIGHT */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Skeleton
              variant="rectangular"
              height={300}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={260}
              sx={{ borderRadius: 2 }}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Pagination Skeleton */}
      <Box sx={{ mt: 3, pt: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
};

export default DashboardSkeleton;
